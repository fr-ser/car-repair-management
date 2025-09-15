import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { cwd } from 'process';

import { ArticlesModule } from './articles/articles.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { ClientsModule } from './clients/clients.module';
import { ENV_FILE_PATH, validate } from './config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_FILE_PATH,
      validate,
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(cwd(), configService.getOrThrow('STATIC_FILE_ROOT')),
          exclude: ['/api/*anywhere'],
        },
      ],
    }),
    AuthModule,
    PrismaModule,
    // the modules below represent domain entities
    ArticlesModule,
    ClientsModule,
    CarsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
