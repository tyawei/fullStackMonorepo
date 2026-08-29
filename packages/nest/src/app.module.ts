import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { HistoryModule } from './history/history.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'
import envConfigObj from './configs/env-config';
import { User } from './user/entities/user.entity';
import { History } from './history/entities/history.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UserModule, 
    HistoryModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      validationSchema: envConfigObj,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // type: configService.get<string>('DB_TYPE') || 'postgres',
        type: 'postgres',
        host: configService.get<string>('PG_HOST') || '',
        port: configService.get<number>('PG_PORT') || 5432,
        username: configService.get<string>('PG_USER') || '',
        password: configService.get<string>('PG_PASSWORD') || '',
        database: configService.get<string>('PG_DATABASE') || '',
        entities: [User, History],
        synchronize: false,
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
