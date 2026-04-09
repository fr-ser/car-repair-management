import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('APP_MAIL_HOST');
    const port = this.configService.get<number>('APP_MAIL_PORT');
    const user = this.configService.get<string>('APP_MAIL_USER');
    const pass = this.configService.get<string>('APP_MAIL_PASSWORD');

    if (!host || !port || !user || !pass) {
      this.logger.warn('Mail not configured — email sending disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });
  }

  async send(options: Mail.Options): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not sent — transporter not configured');
      return;
    }

    const from = this.configService.get<string>('APP_MAIL_FROM');
    await this.transporter.sendMail({ from, ...options });
  }
}
