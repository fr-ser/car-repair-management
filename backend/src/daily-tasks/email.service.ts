import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter!: nodemailer.Transporter;
  private from!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('APP_MAIL_HOST');
    const port = this.configService.get<number>('APP_MAIL_PORT');
    const user = this.configService.get<string>('APP_MAIL_USER');
    const pass = this.configService.get<string>('APP_MAIL_PASSWORD');
    const from = this.configService.get<string>('APP_MAIL_FROM');

    if (!host || !port || !user || !pass || !from) {
      throw new Error(
        'Mail is not configured — set APP_MAIL_HOST, APP_MAIL_PORT, APP_MAIL_USER, APP_MAIL_PASSWORD, APP_MAIL_FROM',
      );
    }

    this.from = from;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });
  }

  async send(options: Mail.Options): Promise<void> {
    await this.transporter.sendMail({ from: this.from, ...options });
  }
}
