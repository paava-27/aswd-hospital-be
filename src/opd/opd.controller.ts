import {Controller,
Post,
Body,
Get,
Param,
Put,
 Delete,
UsePipes,
ValidationPipe,
ParseIntPipe,
UseGuards,
Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { OpdServiceService } from './opd.service';
import { CreateOpdDto } from './dto/patient.dto';

@ApiTags('OPD Service')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('opd')
export class OpdController {
  constructor(private readonly opdService: OpdServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create OPD record (token required)' })
  @ApiBody({ type: CreateOpdDto })
  create(@Body() dto: CreateOpdDto) {
    return this.opdService.create(dto);
  }

  @Get()
@ApiOperation({ summary: 'Get all OPD records with search, date & pagination' })

@ApiQuery({
  name: 'q',
  required: false,
  description: 'Search by patientName, fatherName, referredBy',
  schema: { type: 'string' },
})
@ApiQuery({
  name: 'date',
  required: false,
  description: 'Format: DD/MM/YYYY',
  schema: { type: 'string' },
})
@ApiQuery({
  name: 'page',
  required: false,
  description: 'Page number (default = 1)',
  schema: { type: 'integer', default: 1 },
})
@ApiQuery({
  name: 'limit',
  required: false,
  description: 'Items per page (default = 10, max = 100)',
  schema: { type: 'integer', default: 10 },
})
findAll(
  @Query('q') q?: string,
  @Query('date') date?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
) {
  return this.opdService.findAllWithFilters({
    q,
    date,
    page,
    limit,
  });
}


  @Get(':id')
  @ApiOperation({ summary: 'Get OPD record by ID (token required)' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.opdService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update OPD record (token required)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateOpdDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.opdService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete OPD record (token required)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.opdService.remove(id);
  }
}
