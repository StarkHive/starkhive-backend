import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Contract } from 'src/contract/entities/contract.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';

@Entity('users')
@Index(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(3, 20)  
  username: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  @IsNotEmpty()  
  walletAddress: string;

  @OneToMany(() => Contract, (contract) => contract.user)
  contracts: Contract[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}