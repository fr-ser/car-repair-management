import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { open, stat, writeFile } from 'fs/promises';

const MAX_LOG_BYTES = 1024 * 1024; // 1 MB

@Injectable()
export class LogTrimService {
  private readonly logger = new Logger(LogTrimService.name);

  constructor(private configService: ConfigService) {}

  async run(): Promise<void> {
    const logFilePath = this.configService.getOrThrow<string>('LOG_FILE_PATH');

    const stats = await stat(logFilePath);
    if (stats.size <= MAX_LOG_BYTES) {
      this.logger.log(`Log file is ${stats.size} bytes — no trim needed`);
      return;
    }

    const handle = await open(logFilePath, 'r');
    const buffer = Buffer.alloc(MAX_LOG_BYTES);
    await handle.read(buffer, 0, MAX_LOG_BYTES, stats.size - MAX_LOG_BYTES);
    await handle.close();

    // Advance past the first partial line so we don't keep a truncated entry
    const firstNewline = buffer.indexOf('\n');
    const trimmed =
      firstNewline >= 0 ? buffer.subarray(firstNewline + 1) : buffer;

    await writeFile(logFilePath, trimmed);
    this.logger.log(
      `Log trimmed from ${stats.size} to ${trimmed.length} bytes`,
    );
  }
}
