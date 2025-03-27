import { User } from '@src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected'
}

@Entity()
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentConnections, { onDelete: 'CASCADE' })
  requester: User; // User who sent the connection request

  @ManyToOne(() => User, (user) => user.receivedConnections, { onDelete: 'CASCADE' })
  recipient: User; // User who received the connection request

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus; // Connection status (pending, connected, declined)

  @CreateDateColumn()
  createdAt: Date; // Timestamp when the request was made

  @Column({ nullable: true })
  connectedAt?: Date; // Timestamp when the connection was accepted
}
