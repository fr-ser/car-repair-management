import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { cwd } from 'process';

import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ENV_FILE_PATH, STATIC_FILE_ROOT } from './config';
import { MorganMiddleware } from './middleware/request-log.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

console.log('Full static path:', join(cwd(), STATIC_FILE_ROOT));

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ENV_FILE_PATH }),
    ServeStaticModule.forRoot({
      // nestjs/serve-static already automatically adds `/index.html` at the end
      rootPath: join(cwd(), STATIC_FILE_ROOT),
    }),
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
