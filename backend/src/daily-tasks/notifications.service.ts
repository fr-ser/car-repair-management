import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';

import { PrismaService } from '@/src/prisma/prisma.service';

import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async run(today: dayjs.Dayjs = dayjs()): Promise<void> {
    await this.sendBirthdayReminder(today);
  }

  async sendBirthdayReminder(today: dayjs.Dayjs): Promise<void> {
    const clients = await this.prisma.client.findMany({
      where: { birthday: { not: null } },
    });

    const matches = clients.filter((c) => {
      const birthday = dayjs(c.birthday);
      return (
        birthday.date() === today.date() && birthday.month() === today.month()
      );
    });

    if (matches.length === 0) {
      this.logger.log('Birthday reminder: no birthdays today');
      return;
    }

    const lines = matches.map((c) => {
      const name =
        [c.firstName, c.lastName].filter(Boolean).join(' ') ||
        c.company ||
        `Client ${c.id}`;
      return `- ${name} (${c.birthday})`;
    });

    const to = this.configService.get<string>('APP_MAIL_NOTIFICATION_TO');
    await this.emailService.send({
      to,
      subject: `Geburtstag: ${matches.length} Kunde(n) haben heute Geburtstag`,
      text: `Folgende Kunden haben heute (${today.format('DD.MM.YYYY')}) Geburtstag:\n\n${lines.join('\n')}`,
    });

    this.logger.log(`Birthday reminder sent for ${matches.length} client(s)`);
  }

  async sendTuevReminder(today: dayjs.Dayjs = dayjs()): Promise<void> {
    const cars = await this.prisma.car.findMany({
      where: { inspectionDate: { not: null } },
      include: { client: true },
    });

    const matches = cars.filter((car) => {
      const date = dayjs(car.inspectionDate);
      return date.year() === today.year() && date.month() === today.month();
    });

    if (matches.length === 0) {
      this.logger.log('TÜV reminder: no inspections due this month');
      return;
    }

    const lines = matches.map((car) => {
      const owner = car.client
        ? [car.client.firstName, car.client.lastName]
            .filter(Boolean)
            .join(' ') ||
          car.client.company ||
          `Client ${car.client.id}`
        : 'kein Kunde';
      return `- ${car.licensePlate} ${car.manufacturer} ${car.model} (${car.inspectionDate}) — ${owner}`;
    });

    const to = this.configService.get<string>('APP_MAIL_NOTIFICATION_TO');
    await this.emailService.send({
      to,
      subject: `TÜV: ${matches.length} Fahrzeug(e) zur Hauptuntersuchung fällig`,
      text: `Folgende Fahrzeuge haben diesen Monat (${today.format('MM/YYYY')}) TÜV:\n\n${lines.join('\n')}`,
    });

    this.logger.log(`TÜV reminder sent for ${matches.length} car(s)`);
  }
}
