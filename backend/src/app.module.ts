import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { cwd } from 'process';

import { ArticlesModule } from './articles/articles.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ENV_FILE_PATH, STATIC_FILE_ROOT } from './config';
import { PaginationModule } from './pagination/pagination.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ENV_FILE_PATH }),
    ServeStaticModule.forRoot({
      rootPath: join(cwd(), STATIC_FILE_ROOT),
      exclude: ['/api/*anywhere'],
    }),
    AuthModule,
    PaginationModule,
    PrismaModule,
    // the modules below represent domain entities
    ArticlesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
