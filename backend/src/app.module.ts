import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { cwd } from 'process';

import { ArticlesModule } from './articles/articles.module';
import { JwtAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { ClientsModule } from './clients/clients.module';
import { BlockScannersMiddleware } from './common/middleware/block-scanners.middleware';
import { ENV_FILE_PATH, validate } from './config';
import { DailyTasksModule } from './daily-tasks/daily-tasks.module';
import { DocumentsModule } from './documents/documents.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: 60_000,
          limit: configService.get<number>(
            'LOGIN_THROTTLE_LIMIT_PER_MINUTE',
            10,
          ),
        },
      ],
    }),
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
    OrdersModule,
    DocumentsModule,
    DailyTasksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BlockScannersMiddleware).forRoutes('*');
  }
}
