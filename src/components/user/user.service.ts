import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserQuery, CreateUserInput } from './user.interface';
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
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const { id } = await this.repository.save(this.repository.create(input));

    const user = (await this.findOne({ id })) as User;
    this.eventManager.emit(UserEvent.CREATED, user);

    return user;
  }

  async createForOrganization(input: CreateUserInput): Promise<User> {
    const { id } = await this.repository.save(this.repository.create(input));

    const user = (await this.findOne({ id })) as User;
    this.eventManager.emit(UserEvent.CREATED, user);

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
