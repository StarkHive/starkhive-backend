import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { UserProfile } from '../../user-profile/entities/user-profile.entity';

@Entity()
@Unique(['endorser', 'endorsedProfile', 'skill']) //this ensures a user can endorse a specific skill for another user only once.
export class Endorsement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserProfile, (profile) => profile.givenEndorsements)
  endorser: UserProfile; // user who gives the endorsement.

  @ManyToOne(() => UserProfile, (profile) => profile.receivedEndorsements)
  endorsedProfile: UserProfile; // user receiving the endorsement

  @Column()
  skill: string; //endorsed skill (e.g., "nest.js", "express.js").

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastEndorsedAt: Date;
}
