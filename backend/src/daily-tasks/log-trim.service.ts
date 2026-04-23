import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { open, stat, writeFile } from 'fs/promises';

const MAX_LOG_BYTES = 1024 * 1024; // 1 MB — trim is triggered above this
const TARGET_LOG_BYTES = Math.floor(MAX_LOG_BYTES * (2 / 3)); // trim down to ~667 KB

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

    // Read only the last TARGET_LOG_BYTES of the file into a fixed-size buffer.
    // The read offset (stats.size - TARGET_LOG_BYTES) skips everything before that window,
    // so older log lines are simply never loaded into memory.
    const handle = await open(logFilePath, 'r');
    const buffer = Buffer.alloc(TARGET_LOG_BYTES);
    await handle.read(
      buffer,
      0,
      TARGET_LOG_BYTES,
      stats.size - TARGET_LOG_BYTES,
    );
    await handle.close();

    // The window boundary almost certainly falls mid-line. Skip forward to the
    // next newline so the kept content always starts at a clean line boundary.
    const firstNewline = buffer.indexOf('\n');
    const trimmed =
      firstNewline >= 0 ? buffer.subarray(firstNewline + 1) : buffer;

    // Overwrite the file with just the recent portion (writeFile truncates first).
    await writeFile(logFilePath, trimmed);
    this.logger.log(
      `Log trimmed from ${stats.size} to ${trimmed.length} bytes`,
    );
  }
}
