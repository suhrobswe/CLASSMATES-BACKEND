import { Module } from '@nestjs/common';
import { UserModule } from './api/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from './api/post/post.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { VideoModule } from './api/video/video.module';
import { AuthModule } from './api/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: config.FILE_PATH,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URI,
      synchronize: true,
      entities: ['dist/core/entity/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      ssl:
        config.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),

    JwtModule.register({ global: true }),

    UserModule,
    PostModule,
    VideoModule,
    AuthModule
  ],
})
export class AppModule {}
