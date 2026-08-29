import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDefined, IsInt, IsPositive } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    // 验证id 非空（null undefined）、正整数
    @IsDefined()
    @IsInt()
    @IsPositive()
    id: number;
}
