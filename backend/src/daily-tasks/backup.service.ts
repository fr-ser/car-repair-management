import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';

import { renderPDF } from '@/src/documents/renderPDF';
import { PrismaService } from '@/src/prisma/prisma.service';

import { DropboxService } from './dropbox.service';

const DB_BACKUP_FOLDER = '/backups/db';
const DOC_BACKUP_FOLDER = '/backups/dokumente';
const STATUS_FILE = `${DOC_BACKUP_FOLDER}/.status.txt`;

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private prisma: PrismaService,
    private dropbox: DropboxService,
    private configService: ConfigService,
  ) {}

  async run(today: dayjs.Dayjs = dayjs()): Promise<void> {
    await Promise.all([this.backupDatabase(today), this.backupDocuments()]);
  }

  // ── DB backup ─────────────────────────────────────────────────────────────

  async backupDatabase(today: dayjs.Dayjs = dayjs()): Promise<void> {
    const dbUrl = this.configService.get<string>('DATABASE_URL') ?? '';
    const dbPath = dbUrl.replace(/^file:/, '');
    const absolutePath = path.resolve(process.cwd(), dbPath);

    if (!fs.existsSync(absolutePath)) {
      this.logger.error(`DB backup failed — file not found: ${absolutePath}`);
      return;
    }

    const content = fs.readFileSync(absolutePath);
    const filename = `${today.format('YYYY-MM-DD')}.db`;

    await this.dropbox.uploadFile(`${DB_BACKUP_FOLDER}/${filename}`, content);
    this.logger.log(`DB backup uploaded: ${filename}`);

    await this.pruneDbBackups(today);
  }

  private async pruneDbBackups(today: dayjs.Dayjs): Promise<void> {
    const files = await this.dropbox.listFiles(DB_BACKUP_FOLDER);
    const dateFiles = files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.db$/.test(f))
      .map((f) => ({ name: f, date: dayjs(f.replace('.db', '')) }))
      .filter((f) => f.date.isValid())
      .sort((a, b) => (a.date.isBefore(b.date) ? -1 : 1));

    const keep = new Set<string>();

    // Last 7 days
    for (let i = 0; i < 7; i++) {
      keep.add(`${today.subtract(i, 'day').format('YYYY-MM-DD')}.db`);
    }

    // Latest per month in the current year
    const byMonth = new Map<string, (typeof dateFiles)[0]>();
    for (const f of dateFiles) {
      if (f.date.year() === today.year()) {
        const key = f.date.format('YYYY-MM');
        const existing = byMonth.get(key);
        if (!existing || f.date.isAfter(existing.date)) byMonth.set(key, f);
      }
    }
    for (const f of byMonth.values()) keep.add(f.name);

    // Latest per year for past years
    const byYear = new Map<string, (typeof dateFiles)[0]>();
    for (const f of dateFiles) {
      if (f.date.year() < today.year()) {
        const key = String(f.date.year());
        const existing = byYear.get(key);
        if (!existing || f.date.isAfter(existing.date)) byYear.set(key, f);
      }
    }
    for (const f of byYear.values()) keep.add(f.name);

    for (const f of dateFiles) {
      if (!keep.has(f.name)) {
        await this.dropbox.deleteFile(`${DB_BACKUP_FOLDER}/${f.name}`);
        this.logger.log(`DB backup pruned: ${f.name}`);
      }
    }
  }

  // ── Document backup ───────────────────────────────────────────────────────

  async backupDocuments(): Promise<void> {
    const lastRunAt = await this.readLastRunTimestamp();

    const documents = await this.prisma.document.findMany({
      where: lastRunAt ? { createdAt: { gt: lastRunAt } } : undefined,
      include: { positions: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    if (documents.length === 0) {
      this.logger.log('Document backup: no new documents since last run');
      await this.writeLastRunTimestamp();
      return;
    }

    for (const doc of documents) {
      const pdf = await renderPDF(doc);
      const year = doc.documentDate.slice(0, 4);
      const filename = `${doc.documentNumber ?? doc.id}.pdf`;
      await this.dropbox.uploadFile(
        `${DOC_BACKUP_FOLDER}/${year}/${filename}`,
        pdf,
      );
      this.logger.log(`Document backup uploaded: ${year}/${filename}`);
    }

    await this.writeLastRunTimestamp();
    this.logger.log(
      `Document backup complete — ${documents.length} file(s) uploaded`,
    );
  }

  private async readLastRunTimestamp(): Promise<Date | null> {
    const raw = await this.dropbox.downloadFile(STATUS_FILE);
    if (!raw) return null;
    const ts = raw.toString('utf-8').trim();
    const date = new Date(ts);
    return isNaN(date.getTime()) ? null : date;
  }

  private async writeLastRunTimestamp(): Promise<void> {
    await this.dropbox.uploadFile(STATUS_FILE, new Date().toISOString());
  }
}
