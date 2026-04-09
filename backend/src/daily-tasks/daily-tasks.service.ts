import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BackupService } from './backup.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class DailyTasksService {
  private readonly logger = new Logger(DailyTasksService.name);

  constructor(
    private notifications: NotificationsService,
    private backup: BackupService,
  ) {}

  @Cron('0 4 * * *')
  async runDailyTasks(): Promise<void> {
    this.logger.log('Daily tasks starting');

    await Promise.allSettled([this.notifications.run(), this.backup.run()]);

    this.logger.log('Daily tasks complete');
  }
}
