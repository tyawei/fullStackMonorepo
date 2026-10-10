import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response, Request } from "express";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { decryptPassword } from "src/utils/util";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import { User } from "src/user/entities/user.entity";
import { CryptoService } from "src/crypto/crypto.service";

@Injectable()
export class AuthService {

    private readonly TOKEN_NAME = 'refreshToken'
    private readonly salt = 12
    private cookieOptions: any

    constructor(
        @Inject() private readonly jwtService: JwtService,
        @Inject() private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly cryptoService: CryptoService,
    ) {
        this.cookieOptions = {
            maxAge: 7 * 24 * 3600 * 1000,
            path: '/',
            secure: configService.get('NODE_ENV') === 'production',
            httpOnly: true,
            sameSite: 'strict', // 控制跨站请求是否携带cookie，防止CSRF,Cookie 仅在完全同站的请求中发送，任何形式的跨站请求都不会携带。
        }
    }

    async signIn(userDto: CreateUserDto, res: Response) {
        // 首先查 account 对应 user
        // 解密密码，bcrypt 对比user.password
        // 对比成功，生成 accessToken refreshToken
        // 更新用户数据库中 refreshToken 并挂载到 cookie
        // 返回 accessToken

        const {account, password} = userDto
        // 从前端解密的明文密码
        const pwd = decryptPassword(password, this.cryptoService)

        const user = await this.userService.findOne({account})
        if (!user) {
            throw new HttpException('your account does not exist', HttpStatus.NOT_FOUND)
        }

        // 用明文密码、hash密码进行 bcrypt 对比
        const result = await bcrypt.compare(pwd, user.password)
        if (!result) {
            throw new HttpException('your account or password is incorrect', HttpStatus.NOT_FOUND)
        }

        const {accessToken, refreshToken} = await this.generateTokens(user)

        // bcrypt hash refreshToken ，以备加入数据库
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.salt)
        if (!refreshTokenHash) throw new HttpException('fail to hash token', HttpStatus.INTERNAL_SERVER_ERROR)
        // 更新 refreshTokenHash
        const updateRes = await this.userService.update({id: user.id, refreshTokenHash})

        if (updateRes.affected) {
            // 注意这里不要存 hash后的 refreshToken，否则 refreshToken接口获取的 cookie，无法得到 user
            res.cookie(this.TOKEN_NAME, refreshToken, this.cookieOptions)

            const { password, refreshTokenHash, ...rest } = user
            
            return { accessToken, userInfo: rest }
        } else {
            throw new HttpException('update refreshToken failed', HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    async refreshToken(req: Request, res: Response) {
        // 获取cookie 上的 refreshToken，并解析成 user: {id}；
        // 查这个user，验证 user 是否存在，如果存在且对比数据库refreshTokenHash成功，
        // 则重新生成 accessToken refreshToken
        // 重新设置 cookie 和更新数据库 refreshTokenHash， 返回 accessToken

        const refreshToken = req.cookies[this.TOKEN_NAME] as string
        // refreshToken 解析user
        const result = this.jwtService.verify<User>(refreshToken, {
            secret: this.configService.get('JWT_FRESH_SECRET')
        })


        if (!result || result?.id === undefined) {
            throw new HttpException('fail to get user info from refreshToken', HttpStatus.UNAUTHORIZED)
        } else {
            const user = await this.userService.findOne({id: result.id})

            if (user) {
                const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash)
                if (!isValid) throw new HttpException('token is expired', HttpStatus.UNAUTHORIZED)

                const {accessToken, refreshToken: newRefreshToken} = await this.generateTokens(user)

                // hash token
                const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, this.salt)

                if (!newRefreshTokenHash) throw new HttpException('fail to hash token', HttpStatus.INTERNAL_SERVER_ERROR)
                // 更新数据库 token
                const updateRes = await this.userService.update({id: user.id, refreshTokenHash: newRefreshTokenHash})

                if (!updateRes.affected) throw new HttpException('update refreshToken failed', HttpStatus.INTERNAL_SERVER_ERROR)

                res.cookie(this.TOKEN_NAME, newRefreshToken, this.cookieOptions)

                return { accessToken }
            } else {
                throw new HttpException('the user does not exist', HttpStatus.UNAUTHORIZED)
            }
        }
    }

    async removeRefreshToken(req: Request, res: Response) {
        // 从 cookie上获取 refreshToken
        // 根据refreshToken 获取user.id，并获取数据库中对应 user
        // 验证refreshToken 和 user.refreshTokenHash，确定是当前登录用户 (关键，否则后端存活的token存在滥用安全风险)
        // 清除 cookie上refreshToken 和 数据库 refreshTokenHash 

        const logoutRes = { success: true }
        const serverException = new HttpException('your info does not exist', HttpStatus.UNAUTHORIZED)

        const refreshToken = req.cookies[this.TOKEN_NAME] || ''
        if (!refreshToken) {
            res.clearCookie(this.TOKEN_NAME)
            return logoutRes
        }

        // 从 refreshToken 解析出用户信息
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get('JWT_FRESH_SECRET') || ''
        })
        if (!payload || !payload.id) {
            throw serverException
        }

        const user = await this.userService.findOne({id: payload.id})
        if (!user) throw serverException

        // 和数据库中user 的 refreshTokenHash 对比，确保当前token的用户确认存在且token正确
        const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash)
        if (!isValid) {
            throw new HttpException('your token is incorrect', HttpStatus.UNAUTHORIZED)
        }

        const updateRes = await this.userService.update(
            {id: payload.id, refreshTokenHash: ''}, 
        )
        if (updateRes.affected) {
            res.clearCookie(this.TOKEN_NAME)

            return logoutRes

        } else {
            throw serverException
        }
    }

    // accessToken, refreshToken
    async generateTokens(user: CreateUserDto & {id: number}) {
        const {id, account, roles} = user

        try {
            const accessToken = await this.jwtService.signAsync({id, account, roles}, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES')
            })

            const refreshToken = await this.jwtService.signAsync({id}, {
                secret: this.configService.get('JWT_FRESH_SECRET'),
                expiresIn: this.configService.get('FRESH_TOKEN_EXPIRES')
            })

            return { accessToken, refreshToken }
        } catch {
            throw new HttpException('generate tokens failed', HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }



}