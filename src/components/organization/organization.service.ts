import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import {
  OrganizationQuery,
  CreateOrganizationInput,
} from './organization.interface';
import { Organization } from './organization.entity';
import { EventManagerService } from '../event-manager/event-manager.service';
import { OrganizationEvent } from './organization.event';
import { OrganizationErrorCodes } from './organization.error';
import { hashPassword } from '../../shared/utils/password';
import { UserService } from '../user/user.service';
import { UserType } from '../user/user.enum';
import { MailService } from '../mail/mail.service';
import { OrganizationUserEvent } from '../organization-user/organization-user.event';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private repository: Repository<Organization>,
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(MailService)
    private readonly mailService: MailService,
  ) {}

  generateClientId(): string {
    return nanoid(18);
  }

  /**
   * Creates an organization and its admin user in one transaction, then
   * emails the admin a temporary password (they must reset it on sign-in).
   */
  async create(input: CreateOrganizationInput): Promise<Organization> {
    const { admin: adminInput, ...organizationInput } = input;

    const duplicate = await this.repository.findOne({
      where: { email: organizationInput.email },
    });

    if (duplicate) {
      throw new ConflictException({
        code: OrganizationErrorCodes.OrganizationAlreadyExistsError,
        message: 'An organization with this email already exists',
      });
    }

    const temporaryPassword = nanoid(16);
    const hashedPassword = await hashPassword(temporaryPassword);

    const { organization, admin } = await this.repository.manager.transaction(
      async (manager) => {
        const organizationRepository = manager.getRepository(Organization);
        const organization = await organizationRepository.save(
          organizationRepository.create({
            ...organizationInput,
            clientId: this.generateClientId(),
          }),
        );

        const admin = await this.userService.createForOrganization(
          {
            ...adminInput,
            type: UserType.ADMIN,
            password: hashedPassword,
            organizationId: organization.id,
          },
          manager,
        );

        return { organization, admin };
      },
    );

    this.eventManager.emit(OrganizationUserEvent.CREATED, admin);

    const created = await this.findFullDetails({ id: organization.id });
    this.eventManager.emit(OrganizationEvent.CREATED, created);

    await this.mailService.sendOrganizationAdminOnboardingMail({
      recipients: [admin.email],
      data: {
        firstName: admin.firstName,
        email: admin.email,
        organizationName: created.name,
        clientId: created.clientId,
        temporaryPassword,
      },
    });

    return created;
  }

  async findOne(query: OrganizationQuery): Promise<Organization | null> {
    return this.repository.findOne({ where: query });
  }

  async findFullDetails(query: OrganizationQuery): Promise<Organization> {
    const organization = await this.repository.findOne({ where: query });

    if (!organization) {
      throw new NotFoundException({
        code: OrganizationErrorCodes.OrganizationNotFoundError,
        message: 'Organization not found',
      });
    }

    return organization;
  }
}
