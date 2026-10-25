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
import { BranchServiceService } from './branch-service.service';
import {
  BranchServiceFilterDto,
  CreateBranchServiceDto,
  UpdateBranchServiceDto,
} from './branch-service.dto';
import { ResponseMessage, Roles } from '../../shared/utils/decorators';
import { UserType } from '../user/user.enum';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/branch-services')
export class BranchServiceController {
  constructor(private branchServiceService: BranchServiceService) {}

  @Roles(UserType.ADMIN)
  @Post()
  @ResponseMessage('Branch service created')
  async create(
    @Body() body: CreateBranchServiceDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchServiceService.create({
      organizationId: req.user.organizationId,
      branchId: body.branchId,
      serviceId: body.serviceId,
      price: body.price,
      status: body.status,
    });
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async find(
    @Query() query: BranchServiceFilterDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchServiceService.find(
      {
        organizationId: req.user.organizationId,
        branchId: query.branchId,
        serviceId: query.serviceId,
        status: query.status,
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
    return this.branchServiceService.findOne({
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  @ResponseMessage('Branch service updated')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBranchServiceDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchServiceService.update(
      { id, organizationId: req.user.organizationId },
      { price: body.price, status: body.status },
    );
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  @ResponseMessage('Branch service deleted')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    await this.branchServiceService.delete({
      id,
      organizationId: req.user.organizationId,
    });
  }
}
