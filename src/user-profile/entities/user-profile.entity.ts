import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Endorsement } from '../../endorsement/entities/endorsement.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  walletAddress: string;

  @Column({ default: 0 })
  reputationScore: number;

  @Column({ default: 'ETH' })
  paymentPreference: string;

  @Column('text', { array: true, default: [] })
  skills: string[];

  @Column('text', { array: true, default: [] })
  workHistory: string[];

  @Column({ default: true })
  isActive: boolean;

  
  @OneToMany(() => Endorsement, (endorsement) => endorsement.endorser)
  givenEndorsements: Endorsement[]; //this tracks endorsements given by the user

  @OneToMany(() => Endorsement, (endorsement) => endorsement.endorsedProfile)
  receivedEndorsements: Endorsement[]; //this tracks endorsements received by the user.
}
