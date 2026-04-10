import { Controller, HttpCode, Post } from '@nestjs/common';

import { BackupService } from './backup.service';
import { NotificationsService } from './notifications.service';

@Controller('daily-tasks')
export class DailyTasksController {
  constructor(
    private backup: BackupService,
    private notifications: NotificationsService,
  ) {}

  @Post('trigger/backup')
  @HttpCode(204)
  async triggerBackup(): Promise<void> {
    await this.backup.run();
  }

  @Post('trigger/birthday')
  @HttpCode(204)
  async triggerBirthday(): Promise<void> {
    await this.notifications.sendBirthdayReminder();
  }

  @Post('trigger/tuev')
  @HttpCode(204)
  async triggerTuev(): Promise<void> {
    await this.notifications.sendTuevReminder();
  }
}
