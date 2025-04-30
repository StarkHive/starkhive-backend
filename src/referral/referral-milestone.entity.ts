import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ReferralMilestone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    milestone: number;

    @Column()
    reward: string;
}
