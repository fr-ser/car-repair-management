import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';

@Injectable()
export class DropboxService implements OnModuleInit {
  private readonly logger = new Logger(DropboxService.name);
  private client: Dropbox | null = null;
  private pathPrefix = '';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('DROPBOX_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'DROPBOX_CLIENT_SECRET',
    );
    const refreshToken = this.configService.get<string>(
      'DROPBOX_REFRESH_TOKEN',
    );

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn('Dropbox not configured — uploads disabled');
      return;
    }

    this.pathPrefix =
      this.configService.get<string>('DROPBOX_PATH_PREFIX') ?? '';
    this.client = new Dropbox({ clientId, clientSecret, refreshToken });
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async uploadFile(path: string, content: Buffer | string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`Dropbox upload skipped for ${path} — not configured`);
      return;
    }

    const fullPath = `${this.pathPrefix}${path}`;
    await this.client.filesUpload({
      path: fullPath,
      contents: content,
      mode: { '.tag': 'overwrite' },
    });
  }

  async downloadFile(path: string): Promise<Buffer | null> {
    if (!this.client) return null;

    const fullPath = `${this.pathPrefix}${path}`;
    try {
      const response = await this.client.filesDownload({ path: fullPath });
      // The Dropbox SDK attaches fileBinary at runtime in Node.js but doesn't type it
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const fileBlob = (response.result as any).fileBinary as Buffer;
      return fileBlob;
    } catch {
      return null;
    }
  }

  async listFiles(folderPath: string): Promise<string[]> {
    if (!this.client) return [];

    const fullPath = `${this.pathPrefix}${folderPath}`;
    try {
      const response = await this.client.filesListFolder({ path: fullPath });
      return response.result.entries
        .filter((e) => e['.tag'] === 'file')
        .map((e) => e.name);
    } catch {
      return [];
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.client) return;

    const fullPath = `${this.pathPrefix}${path}`;
    await this.client.filesDeleteV2({ path: fullPath });
  }
}
