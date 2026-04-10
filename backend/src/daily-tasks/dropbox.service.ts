import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';

@Injectable()
export class DropboxService implements OnModuleInit {
  private client!: Dropbox;
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
      throw new Error(
        'Dropbox is not configured — set DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REFRESH_TOKEN',
      );
    }

    this.pathPrefix =
      this.configService.get<string>('DROPBOX_PATH_PREFIX') ?? '';
    this.client = new Dropbox({ clientId, clientSecret, refreshToken });
  }

  async uploadFile(path: string, content: Buffer | string): Promise<void> {
    const fullPath = `${this.pathPrefix}${path}`;
    await this.client.filesUpload({
      path: fullPath,
      contents: content,
      mode: { '.tag': 'overwrite' },
    });
  }

  async downloadFile(path: string): Promise<Buffer | null> {
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
    const fullPath = `${this.pathPrefix}${path}`;
    await this.client.filesDeleteV2({ path: fullPath });
  }
}
