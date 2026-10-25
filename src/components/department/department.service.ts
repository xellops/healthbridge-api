import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Department } from './department.entity';
import {
  CreateDepartmentInput,
  DepartmentFilter,
  DepartmentQuery,
  UpdateDepartmentInput,
} from './department.interface';
import { DepartmentEvent } from './department.event';
import { DepartmentErrorCodes } from './department.error';
import { EventManagerService } from '../event-manager/event-manager.service';
import { UserService } from '../user/user.service';
import { Pagination } from '../../shared/interfaces/pagination.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import { escapeLike, withoutUndefined } from '../../shared/utils/query';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private repository: Repository<Department>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(input: CreateDepartmentInput): Promise<Department> {
    const { id } = await this.repository.save(this.repository.create(input));
    const department = await this.findOne({
      id,
      organizationId: input.organizationId,
    });
    this.eventManager.emit(DepartmentEvent.CREATED, department);

    return department;
  }

  async find(
    { organizationId, status, search }: DepartmentFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<Department>> {
    // Unset fields are left out, since TypeORM throws on `undefined`.
    const where: FindOptionsWhere<Department> = { organizationId };
    if (status) where.status = status;
    const term = search?.trim();
    if (term) where.name = ILike(`%${escapeLike(term)}%`);

    const [records, total] = await this.repository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      total,
      page: pagination.page!,
      limit: pagination.limit!,
      records,
    };
  }

  /** Scoped to the organization, so departments of other organizations are a 404. */
  async findOne(query: DepartmentQuery): Promise<Department> {
    const department = await this.repository.findOne({ where: query });

    if (!department) {
      throw new NotFoundException({
        code: DepartmentErrorCodes.DepartmentNotFoundError,
        message: 'Department not found',
      });
    }

    return department;
  }

  async update(
    query: DepartmentQuery,
    input: UpdateDepartmentInput,
  ): Promise<Department> {
    const changes = withoutUndefined(input);

    if (!Object.keys(changes).length) {
      throw new BadRequestException('Nothing to update');
    }

    const department = await this.findOne(query);

    await this.repository.update({ id: department.id }, changes);
    const updated = await this.findOne(query);
    this.eventManager.emit(DepartmentEvent.UPDATED, updated);

    return updated;
  }

  /** Only departments with no users can be deleted; deactivate the others. */
  async delete(query: DepartmentQuery): Promise<void> {
    const department = await this.findOne(query);

    if (await this.userService.existsInDepartment(department.id)) {
      throw new ConflictException({
        code: DepartmentErrorCodes.DepartmentInUseError,
        message:
          'This department has users assigned to it. Reassign them or deactivate the department instead',
      });
    }
    await this.repository.delete({ id: department.id });
    this.eventManager.emit(DepartmentEvent.DELETED, department);
  }
}
