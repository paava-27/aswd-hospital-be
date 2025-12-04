import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OpdModule } from './opd/opd.module';
import { IpdModule } from './ipd/ipd.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        host: config.get<string>('DB_HOST') || undefined,
        port: config.get<number>('DB_PORT')
          ? Number(config.get<number>('DB_PORT'))
          : undefined,
        username: config.get<string>('DB_USER') || undefined,
        password: config.get<string>('DB_PASS') || undefined,
        database: config.get<string>('DB_NAME') || undefined,
        synchronize: config.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        logging: config.get<string>('TYPEORM_LOGGING') === 'true',
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    OpdModule,
    IpdModule,
  ],
})
export class AppModule {}
