import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PolicyVersion } from '../policy-version/policy-version.entity';
import { UserConsent } from '../user-censent/user-censent.entity';
import { PolicyViolation } from '../policy-violation/policy-violation.entity';

export enum PolicyType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  COMMUNITY_GUIDELINES = 'community_guidelines',
  CONTENT_POLICY = 'content_policy',
  PAYMENT_TERMS = 'payment_terms',
  FREELANCER_AGREEMENT = 'freelancer_agreement',
  CUSTOM = 'custom',
}

export enum PolicyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('policies')
@Index(['type', 'status'])
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    type: 'enum',
    enum: PolicyType,
    default: PolicyType.CUSTOM,
  })
  type: PolicyType;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT,
  })
  status: PolicyStatus;

  @Column({ type: 'boolean', default: false })
  requiresExplicitConsent: boolean;

  @Column({ type: 'boolean', default: false })
  autoEnforce: boolean;

  @OneToMany(() => PolicyVersion, (version) => version.policy, {
    cascade: true,
  })
  versions: PolicyVersion[];

  @OneToMany(() => UserConsent, (consent) => consent.policy)
  userConsents: UserConsent[];

  @OneToMany(() => PolicyViolation, (violation) => violation.policy)
  violations: PolicyViolation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
