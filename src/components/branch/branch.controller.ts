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
import { BranchService } from './branch.service';
import {
  BranchFilterDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './branch.dto';
import { ResponseMessage, Roles } from '../../shared/utils/decorators';
import { UserType } from '../user/user.enum';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';

@Controller('v1/branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Roles(UserType.ADMIN)
  @Post()
  @ResponseMessage('Branch created')
  async create(
    @Body() body: CreateBranchDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchService.create({
      organizationId: req.user.organizationId,
      name: body.name,
      address: body.address,
      phoneNumber: body.phoneNumber,
      email: body.email,
    });
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get()
  @UseInterceptors(PaginationInterceptor)
  async find(
    @Query() query: BranchFilterDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchService.find(
      { organizationId: req.user.organizationId, search: query.search },
      req.pagination,
    );
  }

  @Roles(UserType.ADMIN, UserType.STAFF)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchService.findOne({
      id,
      organizationId: req.user.organizationId,
    });
  }

  @Roles(UserType.ADMIN)
  @Patch(':id')
  @ResponseMessage('Branch updated')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBranchDto,
    @Req() req: ExtendedExpressRequest,
  ) {
    return this.branchService.update(
      { id, organizationId: req.user.organizationId },
      {
        name: body.name,
        address: body.address,
        phoneNumber: body.phoneNumber,
        email: body.email,
      },
    );
  }

  @Roles(UserType.ADMIN)
  @Delete(':id')
  @ResponseMessage('Branch deleted')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: ExtendedExpressRequest,
  ) {
    await this.branchService.delete({
      id,
      organizationId: req.user.organizationId,
    });
  }
}
