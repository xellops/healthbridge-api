import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import {
  UserQuery,
  UserFilter,
  CreateUseForOrganizationInput,
} from './user.interface';
import { User } from './user.entity';
import { EventManagerService } from '../event-manager/event-manager.service';
import { UserEvent } from './user.event';
import { UserStatus } from './user.enum';
import { Pagination } from '../../shared/interfaces/pagination.interface';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
  ) {}

  /**
   * Creates a user that belongs to an organization. Pass `manager` to run
   * inside the caller's transaction; the caller then emits the event once
   * the transaction commits.
   */
  async createForOrganization(
    input: CreateUseForOrganizationInput,
    manager?: EntityManager,
  ): Promise<User> {
    const repository = manager?.getRepository(User) ?? this.repository;
    const { id } = await repository.save(repository.create(input));
    const user = (await repository.findOne({ where: { id } })) as User;

    if (!manager) this.eventManager.emit(UserEvent.CREATED, user);

    return user;
  }

  /**
   * Builds a `where` from a filter. Unset fields are left out, since TypeORM
   * throws on `undefined`. A search becomes an OR across name and email.
   */
  private toWhere({
    organizationId,
    types,
    status,
    search,
  }: UserFilter): FindOptionsWhere<User> | FindOptionsWhere<User>[] {
    const base: FindOptionsWhere<User> = {};
    if (organizationId) base.organizationId = organizationId;
    if (types?.length) base.type = In(types);
    if (status) base.status = status;

    const term = search?.trim();
    if (!term) return base;

    const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
    return [
      { ...base, firstName: ILike(pattern) },
      { ...base, lastName: ILike(pattern) },
      { ...base, email: ILike(pattern) },
    ];
  }

  async find(
    filter: UserFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<User>> {
    const [records, total] = await this.repository.findAndCount({
      where: this.toWhere(filter),
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

  async findOneByFilter(
    filter: UserFilter & { id: string },
  ): Promise<User | null> {
    const { id, ...rest } = filter;
    const where = this.toWhere(rest);
    return this.repository.findOne({
      where: Array.isArray(where)
        ? where.map((w) => ({ ...w, id }))
        : { ...where, id },
    });
  }

  async findOne(query: UserQuery): Promise<User | null> {
    return this.repository.findOne({ where: query });
  }

  async findOneWithPasswordIncluded(query: UserQuery): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(query)
      .getOne();
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    await this.repository.update({ id }, { status });
    return (await this.findOne({ id })) as User;
  }

  async updatePassword(query: UserQuery, password: string): Promise<void> {
    const user = await this.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.repository.update({ id: user.id }, { password });

    this.eventManager.emit(UserEvent.PASSWORD_CHANGED, user);
  }
}
