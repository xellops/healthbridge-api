import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './organization.entity';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization]), UserModule, MailModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
