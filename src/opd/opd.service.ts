import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpdService } from './entities/patient.entity';
import { OpdCustomService } from './entities/custom.service.entity';
import { OpdPaymentDetails } from './entities/payment.entity';
import { CreateOpdDto } from './dto/patient.dto';

@Injectable()
export class OpdServiceService {
  constructor(
    @InjectRepository(OpdService)
    private readonly opdRepository: Repository<OpdService>,
    @InjectRepository(OpdCustomService)
    private readonly svcRepository: Repository<OpdCustomService>,
    @InjectRepository(OpdPaymentDetails)
    private readonly payRepository: Repository<OpdPaymentDetails>,
  ) {}

  private sumServicesTotal(opd: OpdService) {
    if (!opd.customservice) return 0;
    return opd.customservice.reduce(
      (acc, s) => acc + Number(s.totalPrice || 0),
      0,
    );
  }

  private getFeeRs(opd: OpdService) {
    return opd.payment ? Number(opd.payment.feeRs || 0) : 0;
  }

  private attachTotalPaid(opd: OpdService) {
    return {
      ...opd,
      totalpaid: this.sumServicesTotal(opd) + this.getFeeRs(opd),
    };
  }

  async create(dto: CreateOpdDto) {
    if (!dto.patientName || !dto.date || !dto.gender)
      throw new BadRequestException('patientName, date, gender required');

    const opd = new OpdService();
    opd.patientName = dto.patientName;
    opd.fatherName = dto.fatherName ?? null;
    opd.age = dto.age ?? null;
    opd.gender = dto.gender;
    opd.departmentId = dto.departmentId ?? null;
    opd.consultantId = dto.consultantId ?? null;
    opd.referredBy = dto.referredBy ?? null;
    opd.date = new Date(dto.date);

    if (dto.payment) {
      opd.payment = this.payRepository.create({
        rcptNo: dto.payment.rcptNo,
        feeRs: dto.payment.feeRs,
      });
    }

    if (dto.customservice?.length) {
      opd.customservice = dto.customservice.map((c) =>
        this.svcRepository.create({
          serviceName: c.serviceName,
          servicePrice: c.servicePrice,
          serviceQuantity: c.serviceQuantity,
          totalPrice: c.totalPrice,
        }),
      );
    }

    const saved = await this.opdRepository.save(opd);
    return this.attachTotalPaid(saved);
  }

  async findAllWithFilters(query: any) {
  let { q, date, page = 1, limit = 10 } = query;

  page = Number(page);
  limit = Number(limit);

  if (limit > 100) limit = 100;
  if (limit < 1) limit = 1;
  if (page < 1) page = 1;

  const qb = this.opdRepository.createQueryBuilder('opd')
    .leftJoinAndSelect('opd.customservice', 'customservice')
    .leftJoinAndSelect('opd.payment', 'payment');

  if (q) {
    const like = `%${q}%`;
    qb.andWhere(
      `(opd.patientName ILIKE :like 
        OR opd.fatherName ILIKE :like 
        OR opd.referredBy ILIKE :like)`,
      { like }
    );
  }

  if (date) {
    try {
      const [d, m, y] = date.split('/');
      const parsed = new Date(`${y}-${m}-${d}`);
      if (isNaN(parsed.getTime())) throw new BadRequestException('Date must be in DD/MM/YYYY format');

      qb.andWhere(`DATE(opd.date) = DATE(:d)`, { d: parsed });
    } catch {
      throw new BadRequestException('Date must be in DD/MM/YYYY format');
    }
  }

  const total = await qb.getCount();

  const results = await qb
    .orderBy('opd.id', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  const finalResults = results.map((r) => this.attachTotalPaid(r));

  return {
    total,
    page,
    limit,
    results: finalResults,
  };
}


  async findOne(id: number) {
    const opd = await this.opdRepository.findOne({ where: { id } });
    if (!opd) throw new NotFoundException('Record not found');
    return this.attachTotalPaid(opd);
  }

  async update(id: number, body: any) {
    const opd = await this.opdRepository.findOne({
      where: { id },
      relations: ['customservice', 'payment'],
    });

    if (!opd) throw new NotFoundException('Record not found');

    const partial: any = {};

    if (body.patientName !== undefined) partial.patientName = body.patientName;
    if (body.fatherName !== undefined) partial.fatherName = body.fatherName;
    if (body.age !== undefined) partial.age = body.age;
    if (body.gender !== undefined) partial.gender = body.gender;
    if (body.departmentId !== undefined)
      partial.departmentId = body.departmentId;
    if (body.consultantId !== undefined)
      partial.consultantId = body.consultantId;
    if (body.referredBy !== undefined) partial.referredBy = body.referredBy;
    if (body.date !== undefined) partial.date = new Date(body.date);

    if (Object.keys(partial).length) await this.opdRepository.update(id, partial);

    if (body.payment !== undefined) {
      if (opd.payment) {
        await this.payRepository.update(opd.payment.id, {
          rcptNo: body.payment.rcptNo ?? opd.payment.rcptNo,
          feeRs: body.payment.feeRs ?? opd.payment.feeRs,
        });
      } else {
        const newPay = await this.payRepository.save({
          rcptNo: body.payment.rcptNo,
          feeRs: body.payment.feeRs,
        });
        await this.opdRepository.update(id, { payment: newPay });
      }
    }

    if (body.customservice !== undefined) {
      if (!opd.customservice) opd.customservice = [];

      for (const item of body.customservice) {
        if (item.id) {
          const updateObj: any = {};
          if (item.serviceName !== undefined)
            updateObj.serviceName = item.serviceName;
          if (item.servicePrice !== undefined)
            updateObj.servicePrice = item.servicePrice;
          if (item.serviceQuantity !== undefined)
            updateObj.serviceQuantity = item.serviceQuantity;
          if (item.totalPrice !== undefined)
            updateObj.totalPrice = item.totalPrice;

          if (Object.keys(updateObj).length)
            await this.svcRepository.update(item.id, updateObj);
        } else {
          await this.svcRepository.save({
            serviceName: item.serviceName,
            servicePrice: item.servicePrice,
            serviceQuantity: item.serviceQuantity,
            totalPrice: item.totalPrice,
            opd: { id },
          });
        }
      }
    }

    const final = await this.opdRepository.findOne({
      where: { id },
      relations: ['customservice', 'payment'],
    });

    return this.attachTotalPaid(final as OpdService);
  }

  async remove(id: number) {
    const record = await this.opdRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Record not found');
    await this.opdRepository.remove(record);
    return { message: 'Record deleted' };
  }
}