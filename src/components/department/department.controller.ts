import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  DepartmentFilterDto,
  UpdateDepartmentDto,
} from './department.dto';
import { ResponseMessage, Roles } from '../../shared/utils/decorators';
import { UserType } from '../user/user.enum';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Roles(UserType.ADMIN)
  @Post()
  @ResponseMessage('Department created')
  async create(
    @Body() body: CreateDepartmentDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.departmentService.create({
      name: body.name,
      description: body.description,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async find(
    @Query() query: DepartmentFilterDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.departmentService.find(
      {
        organizationId: req.user.organizationId,
        status: query.status,
        search: query.search,
      },
      req.pagination,
    );
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.departmentService.findOne({
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  @ResponseMessage('Department updated')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDepartmentDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.departmentService.update(
      { id, organizationId: req.user.organizationId },
      {
        name: body.name,
        description: body.description,
        status: body.status,
      },
    );
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  @ResponseMessage('Department deleted')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    await this.departmentService.delete({
      id,
      organizationId: req.user.organizationId,
    });
  }
}
