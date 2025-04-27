import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Policy } from '../policy/policy.entity';
import { PolicyVersion } from '../policy-version/policy-version.entity';
import { User } from '../user/entities/user.entity';

@Entity('user_consents')
export class UserConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Policy, (policy) => policy.userConsents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @Column()
  policyId: string;

  @ManyToOne(() => PolicyVersion, (version) => version.userConsents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyVersionId' })
  policyVersion: PolicyVersion;

  @Column()
  policyVersionId: string;

  @Column({ type: 'boolean', default: true })
  hasConsented: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  consentedAt: Date;
}
