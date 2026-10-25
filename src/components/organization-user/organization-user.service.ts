import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  CreateOrganizationUserInput,
  ORGANIZATION_USER_TYPES,
  OrganizationUserFilter,
  SuspendOrganizationUserInput,
  ReactivateOrganizationUserInput,
  ChangeOrganizationUserDepartmentInput,
} from './organization-user.interface';
import { EventManagerService } from '../event-manager/event-manager.service';
import { OrganizationUserEvent } from './organization-user.event';
import { OrganizationUserErrorCodes } from './organization-user.error';
import { hashPassword } from '../../shared/utils/password';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { User } from '../user/user.entity';
import { UserStatus } from '../user/user.enum';
import { UserQuery } from '../user/user.interface';
import { OrganizationService } from '../organization/organization.service';
import { DepartmentService } from '../department/department.service';
import { DepartmentStatus } from '../department/department.enum';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import { Pagination } from '../../shared/interfaces/pagination.interface';

@Injectable()
export class OrganizationUserService {
  constructor(
    @Inject(EventManagerService)
    private readonly eventManager: EventManagerService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(MailService)
    private readonly mailService: MailService,
    @Inject(OrganizationService)
    private readonly organizationService: OrganizationService,
    @Inject(DepartmentService)
    private readonly departmentService: DepartmentService,
  ) {}

  async create(input: CreateOrganizationUserInput): Promise<User> {
    const organization = await this.organizationService.findFullDetails({
      id: input.organizationId,
    });

    const duplicate = await this.userService.findOne({
      email: input.email,
      organizationId: input.organizationId,
    });

    if (duplicate) {
      throw new ConflictException({
        code: OrganizationUserErrorCodes.OrganizationUserAlreadyExistsError,
        message: 'An user with this email already exists in your organization',
      });
    }

    const temporaryPassword = nanoid(16);
    const hashedPassword = await hashPassword(temporaryPassword);

    const user = await this.userService.createForOrganization({
      ...input,
      password: hashedPassword,
    });

    this.eventManager.emit(OrganizationUserEvent.CREATED, user);

    await this.mailService.sendOrganizationAdminOnboardingMail({
      recipients: [user.email],
      data: {
        firstName: user.firstName,
        email: user.email,
        organizationName: organization.name,
        clientId: organization.clientId,
        temporaryPassword,
      },
    });

    return user;
  }

  /** Lists the admin and staff users of an organization. */
  async find(
    { type, ...filter }: OrganizationUserFilter,
    pagination: Pagination = {},
  ): Promise<PaginatedResult<User>> {
    return this.userService.find(
      { ...filter, types: type ? [type] : ORGANIZATION_USER_TYPES },
      pagination,
    );
  }

  /**
   * Fetches one admin or staff user of an organization. Users of other
   * organizations, and patients, are a 404.
   */
  async findOneInOrganization(
    id: string,
    organizationId: string,
  ): Promise<User> {
    const user = await this.userService.findOneByFilter({
      id,
      organizationId,
      types: ORGANIZATION_USER_TYPES,
    });

    if (!user) {
      throw new NotFoundException({
        code: OrganizationUserErrorCodes.OrganizationUserNotFoundError,
        message: 'User not found',
      });
    }

    return user;
  }

  async findOne(query: UserQuery): Promise<User> {
    const user = await this.userService.findOne(query);

    if (!user) {
      throw new NotFoundException({
        code: OrganizationUserErrorCodes.OrganizationUserNotFoundError,
        message: 'User not found',
      });
    }

    return user;
  }

  /**
   * Suspends a user in the caller's organization. A suspended user can't sign
   * in, refresh their token, or use a token issued before the suspension.
   */
  async suspend(input: SuspendOrganizationUserInput): Promise<User> {
    if (input.userId === input.suspendedById) {
      throw new BadRequestException({
        code: OrganizationUserErrorCodes.OrganizationUserSelfSuspensionError,
        message: 'You cannot suspend your own account',
      });
    }

    // Scoped to the organization, so users of other organizations are a 404.
    const user = await this.findOneInOrganization(
      input.userId,
      input.organizationId,
    );

    if (user.status === UserStatus.INACTIVE) {
      throw new ConflictException({
        code: OrganizationUserErrorCodes.OrganizationUserAlreadySuspendedError,
        message: 'This user is already suspended',
      });
    }

    const suspended = await this.userService.updateStatus(
      user.id,
      UserStatus.INACTIVE,
    );
    this.eventManager.emit(OrganizationUserEvent.SUSPENDED, suspended);

    return suspended;
  }

  /** Lifts a suspension so the user can sign in again. */
  async reactivate(input: ReactivateOrganizationUserInput): Promise<User> {
    // Scoped to the organization, so users of other organizations are a 404.
    const user = await this.findOneInOrganization(
      input.userId,
      input.organizationId,
    );

    if (user.status === UserStatus.ACTIVE) {
      throw new ConflictException({
        code: OrganizationUserErrorCodes.OrganizationUserAlreadyActiveError,
        message: 'This user is already active',
      });
    }

    const reactivated = await this.userService.updateStatus(
      user.id,
      UserStatus.ACTIVE,
    );
    this.eventManager.emit(OrganizationUserEvent.REACTIVATED, reactivated);

    return reactivated;
  }

  /**
   * Moves a user to another department in the same organization and emails
   * them about it. The department must be active.
   */
  async changeDepartment(
    input: ChangeOrganizationUserDepartmentInput,
  ): Promise<User> {
    const { userId, organizationId, departmentId } = input;
    const user = await this.findOneInOrganization(userId, organizationId);

    if (user.departmentId === departmentId) {
      throw new ConflictException({
        code: OrganizationUserErrorCodes.OrganizationUserAlreadyInDepartmentError,
        message: 'This user is already in that department',
      });
    }

    // Scoped to the organization, so departments of other organizations are a 404.
    const department = await this.departmentService.findOne({
      id: departmentId,
      organizationId,
    });

    if (department.status !== DepartmentStatus.ACTIVE) {
      throw new BadRequestException({
        code: OrganizationUserErrorCodes.OrganizationUserInactiveDepartmentError,
        message: 'Users cannot be moved to an inactive department',
      });
    }

    const previousDepartment = user.departmentId
      ? await this.departmentService.findOne({
          id: user.departmentId,
          organizationId,
        })
      : null;

    const updated = await this.userService.updateDepartment(
      user.id,
      department.id,
    );
    this.eventManager.emit(OrganizationUserEvent.DEPARTMENT_CHANGED, updated);

    const organization = await this.organizationService.findFullDetails({
      id: organizationId,
    });

    await this.mailService.sendDepartmentChangeMail({
      recipients: [updated.email],
      data: {
        firstName: updated.firstName,
        organizationName: organization.name,
        departmentName: department.name,
        previousDepartmentName: previousDepartment?.name ?? null,
      },
    });

    return updated;
  }
}
