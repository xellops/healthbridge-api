import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserQuery, CreateUseForOrganizationInput } from './user.interface';
import { User } from './user.entity';
import { EventManagerService } from '../event-manager/event-manager.service';
import { UserEvent } from './user.event';

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

  async updatePassword(query: UserQuery, password: string): Promise<void> {
    const user = await this.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.repository.update({ id: user.id }, { password });

    this.eventManager.emit(UserEvent.PASSWORD_CHANGED, user);
  }
}
