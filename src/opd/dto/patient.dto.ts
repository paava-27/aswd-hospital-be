import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  ValidateNested,
  IsArray,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../entities/patient.entity';
import { CreateCustomServiceDto } from './custom-service.dto';
import { CreatePaymentDto } from './payment.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ description: 'ISO datetime with timezone' })
  @IsISO8601()
  date: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @IsOptional()
  age?: number;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ type: Number })
  @IsInt()
  @IsOptional()
  consultantId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referredBy?: string;

  @ApiPropertyOptional({ type: [CreateCustomServiceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomServiceDto)
  @IsOptional()
  customservice?: CreateCustomServiceDto[];

  @ApiPropertyOptional({ type: CreatePaymentDto })
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  @IsOptional()
  payment?: CreatePaymentDto;
}
