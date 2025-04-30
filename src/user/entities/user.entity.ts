import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Contract } from 'src/contract/entities/contract.entity';
import { NotificationSettings } from 'src/notification-settings/entities/notification-settings.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { FreelancerProfile } from 'src/freelancer-profile/entities/freelancer-profile.entity';
import { Post } from 'src/post/entities/post.entity';
import { AuditLog } from '@src/audit/entitites/audit-log.entity';
import { Content } from '@src/content/entities/content.entity';
import { Connection } from '@src/connection/entities/connection.entity';
import { ConnectionNotification } from '@src/notifications/entities/connection-notification.entity';
import { UserSkill } from '../../skills/entities/skill.entity';
import { Reputation } from '@src/reputation/Reputation.entity';
import { Report } from '@src/reports/report.entity';
import { UserSession } from '@src/user-session/entities/user-session.entity';
import { AvailabilityCalendar } from '@src/availability-calendar/entities/availability-calendar.entity';

@Entity('users')
@Index(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Reputation, (reputation) => reputation.user, {
    cascade: true,
  })
  reputation: Reputation;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @Length(3, 20)
  username?: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsString()
  password: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  walletAddress?: string;

  @OneToMany(() => Contract, (contract) => contract.user)
  contracts?: Contract[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => NotificationSettings, (notification) => notification.user)
  notificationSettings: NotificationSettings[];

  @IsBoolean()
  @Column({ nullable: true })
  isEmailVerified: boolean;

  @IsString()
  @Column({ nullable: true })
  emailTokenVerification?: string;

  @IsString()
  resetToken: string;

  @IsDate()
  tokenExpires: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Content, (content) => content.creator)
  content: Content[];

  @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
  skills: UserSkill[];

  @OneToOne(
    () => FreelancerProfile,
    (freelancerProfile) => freelancerProfile.user,
    { cascade: true },
  )
  freelancerProfile: FreelancerProfile;

  // OAuth fields
  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ nullable: true })
  linkedinId?: string;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @Column({ nullable: true })
  connectionPrivacy?: string;

  @OneToMany(() => Connection, (connection) => connection.requester)
  sentConnections: Connection[];

  @OneToMany(() => Connection, (connection) => connection.recipient)
  receivedConnections: Connection[];

  @OneToMany(
    () => ConnectionNotification,
    (notification) => notification.user,
    { cascade: true },
  )
  notifications: Notification[];

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaSecret: string | null;

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => AvailabilityCalendar, (a) => a.user)
  availabilities: AvailabilityCalendar[];

}
