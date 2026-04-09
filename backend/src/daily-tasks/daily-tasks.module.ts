import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BackupService } from './backup.service';
import { DailyTasksService } from './daily-tasks.service';
import { DropboxService } from './dropbox.service';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    DailyTasksService,
    NotificationsService,
    BackupService,
    EmailService,
    DropboxService,
  ],
})
export class DailyTasksModule {}
