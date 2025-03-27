import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class JobNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // the user to notify

  @Column()
  type: string;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
