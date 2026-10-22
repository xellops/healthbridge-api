import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../mail/mail.module';
import { OtpModule } from '../otp/otp.module';
import { AppNotificationModule } from '../app-notification/app-notification.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    // Secrets and TTLs are passed per call in AuthService and AuthGuard.
    JwtModule.register({ global: true }),
    MailModule,
    OtpModule,
    AppNotificationModule,
    OrganizationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
