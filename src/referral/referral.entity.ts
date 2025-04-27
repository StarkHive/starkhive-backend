import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Entity()
export class Referral {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, type: 'varchar' })
    referralCode: string;

    @ManyToOne(() => User, (user) => user.referrals, { nullable: true })
    referrer: User | null;

    @Column({ default: 0 })
    signups: number;

    @Column({ default: false })
    milestoneRewarded: boolean;
}
