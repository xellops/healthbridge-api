import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrganizationQuery,
  CreateOrganizationInput,
} from './organization.interface';
import { Organization } from './organization.entity';
import { EventManagerService } from '../event-manager/event-manager.service';
import { OrganizationEvent } from './organization.event';
import { OrganizationErrorCodes } from './organization.error';
import nanoid from 'nanoid';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { UserType } from '../user/user.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private repository: Repository<Organization>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  generateClientId(): string {
    return nanoid.random(18).toString();
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const {
      branch: branchInput,
      admin: adminInput,
      ...orgnazationInput
    } = input;

    const clientId = this.generateClientId();
    const { id } = await this.repository.save(
      this.repository.create({ ...orgnazationInput, clientId }),
    );

    // Create Organization ADMIN
    const adminPassword = nanoid.random(24).toString();
    const hashedAdminPassword =
      await this.authService.hashPassword(adminPassword);

    await this.userService.createForOrganization({
      ...adminInput,
      type: UserType.ADMIN,
      password: hashedAdminPassword,
    });

    const organization = (await this.findOne({ id })) as Organization;
    this.eventManager.emit(OrganizationEvent.CREATED, organization);

    return organization;
  }

  async findOne(query: OrganizationQuery): Promise<Organization | null> {
    return this.repository.findOne({ where: query });
  }

  async findFullDetails(query: OrganizationQuery): Promise<Organization> {
    const orgnaization = await this.repository.findOne({ where: query });

    if (!orgnaization) {
      throw new NotFoundException({
        code: OrganizationErrorCodes.OrganizationNotFoundError,
        message: 'Orgnaization not found',
      });
    }

    return orgnaization;
  }
}
