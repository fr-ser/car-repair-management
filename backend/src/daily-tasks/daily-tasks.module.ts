import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BackupService } from './backup.service';
import { DailyTasksController } from './daily-tasks.controller';
import { DailyTasksService } from './daily-tasks.service';
import { DropboxService } from './dropbox.service';
import { EmailService } from './email.service';
import { LogTrimService } from './log-trim.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [DailyTasksController],
  providers: [
    DailyTasksService,
    NotificationsService,
    BackupService,
    EmailService,
    DropboxService,
    LogTrimService,
  ],
})
export class DailyTasksModule {}
