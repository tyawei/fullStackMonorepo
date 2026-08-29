import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

// 指定数据表，如果不指定，就是默认的类名小写
@Entity('depositeds')
export class History {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    order_id: string;

    @Column()
    contract_address: string;

    @Column()
    user_address: string;

    @Column()
    token_address: string;

    @Column()
    amount: string;

    @Column()
    maturity_time: string;

    @Column()
    chain_id: number;

    @Column()
    block_number: number;

    @Column()
    block_timestamp: number;

    @Column()
    tx_hash: string;

    @CreateDateColumn()
    created_at: Date;
}
