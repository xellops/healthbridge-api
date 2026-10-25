import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizationUserService } from './organization-user.service';
import {
  ChangeOrganizationUserDepartmentDto,
  CreateOrganizationUserDto,
  OrganizationUserFilterDto,
} from './organization-user.dto';
import { ResponseMessage, Roles } from '../../shared/utils/decorators';
import { UserType } from '../user/user.enum';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/organization-users')
export class OrganizationUserController {
  constructor(private organizationUserService: OrganizationUserService) {}

  @Roles(UserType.ADMIN)
  @Post()
  @ResponseMessage('Organization user created')
  async create(
    @Body() body: CreateOrganizationUserDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.create({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async find(
    @Query() query: OrganizationUserFilterDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.find(
      {
        organizationId: req.user.organizationId,
        type: query.type,
        status: query.status,
        search: query.search,
      },
      req.pagination,
    );
  }

  @Roles(UserType.ADMIN)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.findOneInOrganization(
      id,
      req.user.organizationId,
    );
  }

  @Roles(UserType.ADMIN)
  @Patch(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Organization user suspended')
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.suspend({
      userId: id,
      organizationId: req.user.organizationId,
      suspendedById: req.user.id,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Organization user reactivated')
  async reactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.reactivate({
      userId: id,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id/department')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Organization user moved to department')
  async changeDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeOrganizationUserDepartmentDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.organizationUserService.changeDepartment({
      userId: id,
      organizationId: req.user.organizationId,
      departmentId: body.departmentId,
    });
  }
}
