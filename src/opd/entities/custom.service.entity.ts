import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OpdService } from './patient.entity';

@Entity({ name: 'opdcustomservice' })
export class OpdCustomService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  serviceName: string;

  @Column({ type: 'numeric' })
  servicePrice: number;

  @Column({ type: 'int' })
  serviceQuantity: number;

  @Column({ type: 'numeric' })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OpdService, (p) => p.customservice, { onDelete: 'CASCADE' })
  opd: OpdService;
}
