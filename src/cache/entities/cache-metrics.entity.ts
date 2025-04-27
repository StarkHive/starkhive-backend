import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cache_metrics")
export class CacheMetricsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    type: 'hit' | 'miss';

    @Column({ type: "varchar", length: 255 })
    cacheKey: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    service: string;

    @CreateDateColumn()
    timestamp: Date;
}
