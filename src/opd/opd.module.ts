import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpdService } from './entities/patient.entity';
import { OpdCustomService } from './entities/custom.service.entity';
import { OpdPaymentDetails } from './entities/payment.entity';
import { OpdController } from './opd.controller';
import { OpdServiceService } from './opd.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpdService, OpdCustomService, OpdPaymentDetails]),
  ],
  controllers: [OpdController],
  providers: [OpdServiceService],
  exports: [OpdServiceService],
})
export class OpdModule {}
