import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization]), UserModule, AuthModule],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
