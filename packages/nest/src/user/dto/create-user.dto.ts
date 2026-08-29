import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    account: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    // 角色字符串需要特定值，由管道验证
    @IsString()
    @IsOptional()
    roles: string;

    @IsString()
    @IsOptional()
    refreshTokenHash: string;
}
