import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OpdService } from './patient.entity';

@Entity({ name: 'opdpaymentdetails' })
export class OpdPaymentDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rcptNo: string;

  @Column({ type: 'numeric' })
  feeRs: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => OpdService, (p) => p.payment, { onDelete: 'CASCADE' })
  opd: OpdService;
}
