import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoryDto } from './create-history.dto';
import { IsDefined, IsInt, IsPositive, } from 'class-validator';

export class UpdateHistoryDto extends PartialType(CreateHistoryDto) {
    @IsDefined()
    @IsInt()
    @IsPositive()
    id: number;    
}
