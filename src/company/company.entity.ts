import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn
  } from 'typeorm';
//   import { User } from '../../user/entities/user.entity';
  
  @Entity()
  export class Company {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true, nullable: false })
    name: string;
  
    @Column({ nullable: false })
    description: string;
  
    @Column({ nullable: false })
    website: string;
  
    @Column({ nullable: false })
    walletAddress: string;
  
    // @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
    // owner: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()   //needed for soft deletion
    deletedAt?: Date;
  }
  