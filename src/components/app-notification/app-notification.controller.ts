import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { PaginationInterceptor } from '../../shared/interceptors/pagination.interception';
import type { ExtendedExpressRequest } from '../../shared/interfaces/request.interface';
import { AppNotificationRecipientService } from '../app-notification-recipient/app-notification-recipient.service';
import {
  MarkNotificationAsReadDto,
  UserAppNotificationFilterDto,
} from './app-notification.dto';

@Controller('v1/notifications')
export class AppNotificationController {
  constructor(
    private appNotificationRecipientService: AppNotificationRecipientService,
  ) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  async findAppNotificationRecipients(
    @Req() req: ExtendedExpressRequest,
    @Query() query: UserAppNotificationFilterDto,
  ) {
    return this.appNotificationRecipientService.find(
      {
        status: query.status,
        organizationId: query.organizationId,
        userId: req.user.id,
      },
      req.pagination,
    );
  }

  @Post('mark-as-read')
  async markAsRead(
    @Req() req: ExtendedExpressRequest,
    @Body() body: MarkNotificationAsReadDto,
  ) {
    await this.appNotificationRecipientService.markAsRead({
      notificationId: body.notificationId,
      userId: req.user.id,
    });
  }
}
