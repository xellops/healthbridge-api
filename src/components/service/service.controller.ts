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
import { ServiceService } from './service.service';
import {
  CreateServiceDto,
  ServiceFilterDto,
  UpdateServiceDto,
} from './service.dto';
import { ResponseMessage, Roles } from '../../shared/utils/decorators';
import { UserType } from '../user/user.enum';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Roles(UserType.ADMIN)
  @Post()
  @ResponseMessage('Service created')
  async create(
    @Body() body: CreateServiceDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.serviceService.create({
      organizationId: req.user.organizationId,
      name: body.name,
      description: body.description,
      status: body.status,
    });
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async find(
    @Query() query: ServiceFilterDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.serviceService.find(
      {
        organizationId: req.user.organizationId,
        status: query.status,
        isSystemGenerated: query.isSystemGenerated,
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
    return this.serviceService.findOne({
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  @ResponseMessage('Service updated')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateServiceDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.serviceService.update(
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
  @ResponseMessage('Service deleted')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    await this.serviceService.delete({
      id,
      organizationId: req.user.organizationId,
    });
  }
}
