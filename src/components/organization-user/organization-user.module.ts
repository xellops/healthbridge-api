import { Module } from '@nestjs/common';
import { OrganizationUserService } from './organization-user.service';
import { OrganizationUserController } from './organization-user.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [UserModule, MailModule, OrganizationModule],
  controllers: [OrganizationUserController],
  providers: [OrganizationUserService],
  exports: [OrganizationUserService],
})
export class OrganizationUserModule {}
