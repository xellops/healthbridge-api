import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchService } from './branch-service.entity';
import {
  BranchServiceFilter,
  BranchServiceQuery,
  CreateBranchServiceInput,
  UpdateBranchServiceInput,
} from './branch-service.interface';
import { BranchServiceEvent } from './branch-service.event';
import { BranchServiceErrorCodes } from './branch-service.error';
import { BranchServiceStatus } from './branch-service.enum';
import { EventManagerService } from '../event-manager/event-manager.service';
import { BranchService as BranchesService } from '../branch/branch.service';
import { ServiceService } from '../service/service.service';
import { ServiceStatus } from '../service/service.enum';
import { Pagination } from '../../shared/interfaces/pagination.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import { isUniqueViolation, withoutUndefined } from '../../shared/utils/query';

/** Responses include the branch and service so clients don't need extra calls. */
const relations = { branch: true, service: true } as const;

@Injectable()
export class BranchServiceService {
  constructor(
    @InjectRepository(BranchService)
    private repository: Repository<BranchService>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
    @Inject(BranchesService)
    private readonly branchesService: BranchesService,
    @Inject(ServiceService)
    private readonly serviceService: ServiceService,
  ) {}

  private alreadyExists() {
    return new ConflictException({
      code: BranchServiceErrorCodes.BranchServiceAlreadyExistsError,
      message:
        'This service already has a price in this branch. Update that price instead',
    });
  }

  async create(input: CreateBranchServiceInput): Promise<BranchService> {
    const { organizationId, branchId, serviceId } = input;

    // The branch must be the organization's; the service its own or
    // system-generated (404 otherwise).
    await this.branchesService.findOne({ id: branchId, organizationId });
    const service = await this.serviceService.findOne({
      id: serviceId,
      organizationId,
    });

    if (service.status !== ServiceStatus.ACTIVE) {
      throw new BadRequestException({
        code: BranchServiceErrorCodes.BranchServiceInactiveServiceError,
        message: 'Inactive services cannot be added to a branch',
      });
    }

    if (await this.repository.exists({ where: { branchId, serviceId } })) {
      throw this.alreadyExists();
    }

    let id: string;
    try {
      ({ id } = await this.repository.save(this.repository.create(input)));
    } catch (error) {
      // Lost a race with a concurrent create.
      if (isUniqueViolation(error)) throw this.alreadyExists();
      throw error;
    }

    const branchService = await this.findOne({ id, organizationId });
    this.eventManager.emit(BranchServiceEvent.CREATED, branchService);

    return branchService;
  }

  async find(
    filter: BranchServiceFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<BranchService>> {
    const [records, total] = await this.repository.findAndCount({
      where: withoutUndefined(filter),
      relations,
      order: { createdAt: 'DESC' },
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

  /** Scoped to the organization, so other organizations' prices are a 404. */
  async findOne(query: BranchServiceQuery): Promise<BranchService> {
    const branchService = await this.repository.findOne({
      where: query,
      relations,
    });

    if (!branchService) {
      throw new NotFoundException({
        code: BranchServiceErrorCodes.BranchServiceNotFoundError,
        message: 'Branch service not found',
      });
    }

    return branchService;
  }

  async update(
    query: BranchServiceQuery,
    input: UpdateBranchServiceInput,
  ): Promise<BranchService> {
    const changes = withoutUndefined(input);

    if (!Object.keys(changes).length) {
      throw new BadRequestException('Nothing to update');
    }

    const branchService = await this.findOne(query);

    if (
      changes.status === BranchServiceStatus.ACTIVE &&
      branchService.service.status !== ServiceStatus.ACTIVE
    ) {
      throw new BadRequestException({
        code: BranchServiceErrorCodes.BranchServiceInactiveServiceError,
        message:
          'This service is inactive, so it cannot be activated at a branch',
      });
    }

    await this.repository.update({ id: branchService.id }, changes);
    const updated = await this.findOne(query);
    this.eventManager.emit(BranchServiceEvent.UPDATED, updated);

    return updated;
  }

  async delete(query: BranchServiceQuery): Promise<void> {
    const branchService = await this.findOne(query);
    await this.repository.delete({ id: branchService.id });
    this.eventManager.emit(BranchServiceEvent.DELETED, branchService);
  }
}
