import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BackupService } from './backup.service';
import { LogTrimService } from './log-trim.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class DailyTasksService {
  private readonly logger = new Logger(DailyTasksService.name);

  constructor(
    private notifications: NotificationsService,
    private backup: BackupService,
    private logTrim: LogTrimService,
  ) {}

  @Cron('0 4 * * *')
  async runDailyTasks(): Promise<void> {
    this.logger.log('Daily tasks starting');

    const results = await Promise.allSettled([
      this.notifications.run(),
      this.backup.run(),
      this.logTrim.run(),
    ]);

    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.error('Daily task failed', result.reason);
      }
    }

    this.logger.log('Daily tasks complete');
  }

  @Cron('0 4 1 * *')
  async runMonthlyTasks(): Promise<void> {
    this.logger.log('Monthly tasks starting');

    await this.notifications.sendTuevReminder();

    this.logger.log('Monthly tasks complete');
  }
}
