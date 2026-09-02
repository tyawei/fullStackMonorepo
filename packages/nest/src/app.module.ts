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
      useFactory: (configService: ConfigService) => {
        // type: configService.get<string>('DB_TYPE') || 'postgres',
        console.log('node_env===', configService.get<string>('NODE_ENV'))
        return  {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST') || '',
          port: configService.get<number>('POSTGRES_PORT') || 5432,
          username: configService.get<string>('POSTGRES_USER') || '',
          password: configService.get<string>('POSTGRES_PASSWORD') || '',
          database: configService.get<string>('POSTGRES_DB') || '',
          entities: [User, History],
          // synchronize: configService.get<string>('NODE_ENV') === 'development',
          synchronize: true,
          autoLoadEntities: true,
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
