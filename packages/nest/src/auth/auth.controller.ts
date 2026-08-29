import { Controller, Req, Body, Post, Res, HttpStatus, HttpCode } from "@nestjs/common";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('signIn')
    async signIn(
        @Body() userDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return await this.authService.signIn(userDto, res)
    }

    @HttpCode(HttpStatus.OK)
    @Post('refreshToken')
    async refreshToken(
        @Req() req: Request, @Res() res: Response
    ) {
        return await this.authService.refreshToken(req, res)
    }

    // 退出登录
    @Post('removeRefreshToken')
    async removeRefreshToken(
        @Req() req: Request, @Res() res: Response
    ) {
        return await this.authService.removeRefreshToken(req, res)
    }

}