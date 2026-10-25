import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Branch } from './branch.entity';
import {
  BranchFilter,
  BranchQuery,
  CreateBranchInput,
  UpdateBranchInput,
} from './branch.interface';
import { BranchEvent } from './branch.event';
import { BranchErrorCodes } from './branch.error';
import { EventManagerService } from '../event-manager/event-manager.service';
import { Pagination } from '../../shared/interfaces/pagination.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import {
  escapeLike,
  isForeignKeyViolation,
  withoutUndefined,
} from '../../shared/utils/query';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private repository: Repository<Branch>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
  ) {}

  async create(input: CreateBranchInput): Promise<Branch> {
    const { id } = await this.repository.save(this.repository.create(input));
    const branch = await this.findOne({
      id,
      organizationId: input.organizationId,
    });
    this.eventManager.emit(BranchEvent.CREATED, branch);

    return branch;
  }

  async find(
    { organizationId, search }: BranchFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<Branch>> {
    const base: FindOptionsWhere<Branch> = { organizationId };
    const term = search?.trim();
    const pattern = term ? ILike(`%${escapeLike(term)}%`) : undefined;

    const [records, total] = await this.repository.findAndCount({
      where: pattern
        ? [
            { ...base, name: pattern },
            { ...base, address: pattern },
          ]
        : base,
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

  /** Scoped to the organization, so branches of other organizations are a 404. */
  async findOne(query: BranchQuery): Promise<Branch> {
    const branch = await this.repository.findOne({ where: query });

    if (!branch) {
      throw new NotFoundException({
        code: BranchErrorCodes.BranchNotFoundError,
        message: 'Branch not found',
      });
    }

    return branch;
  }

  async update(query: BranchQuery, input: UpdateBranchInput): Promise<Branch> {
    const changes = withoutUndefined(input);

    if (!Object.keys(changes).length) {
      throw new BadRequestException('Nothing to update');
    }

    const branch = await this.findOne(query);
    await this.repository.update({ id: branch.id }, changes);
    const updated = await this.findOne(query);
    this.eventManager.emit(BranchEvent.UPDATED, updated);

    return updated;
  }

  /** A branch that is still referenced (e.g. by its service prices) can't be deleted. */
  async delete(query: BranchQuery): Promise<void> {
    const branch = await this.findOne(query);

    try {
      await this.repository.delete({ id: branch.id });
    } catch (error) {
      if (!isForeignKeyViolation(error)) throw error;

      throw new ConflictException({
        code: BranchErrorCodes.BranchInUseError,
        message:
          'This branch is in use (for example, it has service prices). Remove those first',
      });
    }

    this.eventManager.emit(BranchEvent.DELETED, branch);
  }
}
