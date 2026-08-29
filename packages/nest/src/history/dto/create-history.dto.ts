import { IsString, IsNumber, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export class CreateHistoryDto {

    @IsString()
    @IsNotEmpty()
    order_id: string;

    @IsString()
    @IsNotEmpty()
    contract_address: string;

    @IsString()
    @IsNotEmpty()
    user_address: string;

    @IsString()
    @IsNotEmpty()
    token_address: string;

    @IsString()
    @IsNotEmpty()
    amount: string;

    @IsString()
    maturity_time: string;

    @IsNumber()
    @IsNotEmpty()
    chain_id: number;

    @IsNumber()
    @IsNotEmpty()
    block_number: number;

    @IsNumber()
    @IsNotEmpty()
    block_timestamp: number;

    @IsString()
    @IsOptional()
    tx_hash: string;

    @CreateDateColumn()
    @IsOptional()
    created_at: Date;
}
