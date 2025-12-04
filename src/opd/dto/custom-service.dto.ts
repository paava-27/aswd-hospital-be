import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomServiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  servicePrice: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(1)
  serviceQuantity: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  totalPrice: number;
}
