import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { VerificationStatus } from '../enums/verification-status.enum';

@Entity()
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  documentType: string; // passport, id_card, driver_license, etc.

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
encryptionKey?: string | null;


  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  reviewedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  reviewedAt?: Date;
}