import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Watchlist } from '../../watchlist/entities/watchlist.entity'; 

@Entity('recruiters')
export class Recruiter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Watchlist, (watchlist) => watchlist.recruiter)
  watchlists: Watchlist[];
}
