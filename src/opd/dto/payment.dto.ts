import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rcptNo: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Min(0)
  feeRs: number;
}
