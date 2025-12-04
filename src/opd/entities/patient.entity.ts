import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OpdCustomService } from './custom.service.entity';
import { OpdPaymentDetails } from './payment.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity({ name: 'opdservice' })
export class OpdService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientName: string;

  @Column({ type: 'varchar', nullable: true })
  fatherName?: string | null;

  @Column({ type: 'int', nullable: true })
  age?: number | null;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'int', nullable: true })
  departmentId?: number | null;

  @Column({ type: 'int', nullable: true })
  consultantId?: number | null;

  @Column({ type: 'varchar', nullable: true })
  referredBy?: string | null;

  @Column({ type: 'timestamptz' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OpdCustomService, (s) => s.opd, {
    cascade: true,
    eager: true,
  })
  customservice: OpdCustomService[];

  @OneToOne(() => OpdPaymentDetails, (p) => p.opd, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  payment: OpdPaymentDetails;
}
