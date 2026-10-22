import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './organization.dto';
import { Public, ResponseMessage } from '../../shared/utils/decorators';

@Controller('v1/organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  /** Registers a hospital and its admin user. The org starts inactive. */
  @Public()
  @Post()
  @ResponseMessage('Organization created')
  async create(@Body() body: CreateOrganizationDto) {
    return this.organizationService.create(body);
  }
}
