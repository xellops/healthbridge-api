import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { Service } from './service.entity';
import { ServiceStatus } from './service.enum';
import { BranchService } from '../branch-service/branch-service.entity';
import { BranchServiceStatus } from '../branch-service/branch-service.enum';
import {
  CreateServiceInput,
  ServiceFilter,
  ServiceQuery,
  UpdateServiceInput,
} from './service.interface';
import { ServiceEvent } from './service.event';
import { ServiceErrorCodes } from './service.error';
import { EventManagerService } from '../event-manager/event-manager.service';
import { Pagination } from '../../shared/interfaces/pagination.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import {
  escapeLike,
  isForeignKeyViolation,
  withoutUndefined,
} from '../../shared/utils/query';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private repository: Repository<Service>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
  ) {}

  /** The services an organization can see: its own plus the system-generated ones. */
  private visibleTo(
    organizationId: string,
    isSystemGenerated?: boolean,
  ): FindOptionsWhere<Service>[] {
    const own = { organizationId, isSystemGenerated: false };
    const system = { organizationId: IsNull(), isSystemGenerated: true };

    if (isSystemGenerated === true) return [system];
    if (isSystemGenerated === false) return [own];
    return [own, system];
  }

  async create(input: CreateServiceInput): Promise<Service> {
    const { id } = await this.repository.save(
      this.repository.create({ ...input, isSystemGenerated: false }),
    );
    const service = await this.findOne({
      id,
      organizationId: input.organizationId,
    });
    this.eventManager.emit(ServiceEvent.CREATED, service);

    return service;
  }

  async find(
    { organizationId, status, isSystemGenerated, search }: ServiceFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<Service>> {
    const term = search?.trim();
    const extra: FindOptionsWhere<Service> = {};
    if (status) extra.status = status;
    if (term) extra.name = ILike(`%${escapeLike(term)}%`);

    const [records, total] = await this.repository.findAndCount({
      where: this.visibleTo(organizationId, isSystemGenerated).map((w) => ({
        ...w,
        ...extra,
      })),
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

  /**
   * Fetches a service the organization can see (its own or system-generated).
   * Other organizations' services are a 404.
   */
  async findOne({ id, organizationId }: ServiceQuery): Promise<Service> {
    const service = await this.repository.findOne({
      where: this.visibleTo(organizationId).map((w) => ({ ...w, id })),
    });

    if (!service) {
      throw new NotFoundException({
        code: ServiceErrorCodes.ServiceNotFoundError,
        message: 'Service not found',
      });
    }

    return service;
  }

  /** Like `findOne`, but refuses system-generated services (403). Used before changes. */
  private async findOneOwned(query: ServiceQuery): Promise<Service> {
    const service = await this.findOne(query);

    if (service.isSystemGenerated) {
      throw new ForbiddenException({
        code: ServiceErrorCodes.ServiceSystemGeneratedError,
        message: 'System-generated services cannot be changed or deleted',
      });
    }

    return service;
  }

  async update(
    query: ServiceQuery,
    input: UpdateServiceInput,
  ): Promise<Service> {
    const changes = withoutUndefined(input);

    if (!Object.keys(changes).length) {
      throw new BadRequestException('Nothing to update');
    }

    const service = await this.findOneOwned(query);

    await this.repository.manager.transaction(async (manager) => {
      await manager.update(Service, { id: service.id }, changes);

      // A service that goes inactive is no longer offered at any branch
      // (prd/service.md). Reactivating it leaves branches to opt back in.
      if (changes.status === ServiceStatus.INACTIVE) {
        await manager.update(
          BranchService,
          { serviceId: service.id },
          { status: BranchServiceStatus.INACTIVE },
        );
      }
    });

    const updated = await this.findOne(query);
    this.eventManager.emit(ServiceEvent.UPDATED, updated);

    return updated;
  }

  /** A service that is still referenced (e.g. priced in a branch) can't be deleted. */
  async delete(query: ServiceQuery): Promise<void> {
    const service = await this.findOneOwned(query);

    try {
      await this.repository.delete({ id: service.id });
    } catch (error) {
      if (!isForeignKeyViolation(error)) throw error;

      throw new ConflictException({
        code: ServiceErrorCodes.ServiceInUseError,
        message:
          'This service is in use (for example, it is priced in a branch). Deactivate it instead',
      });
    }

    this.eventManager.emit(ServiceEvent.DELETED, service);
  }
}
