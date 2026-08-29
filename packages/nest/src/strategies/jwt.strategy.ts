import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy, } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'

// Jwt认证流程：
// 认证模块注册 jwt 策略：(PassportModule.register)
// jwt 模块注册 jwt 策略的配置
// 定义 jwt对应的认证策略细节（jwt.strategy.ts，validate 方法返回挂载到 user 属性上的对象）
// jwt.strategy.ts 通过providers 全局注入，AuthGuard('jwt') 成为一个使用 jwt策略的认证守卫
// 然后定义一个 JwtAuthGuard 继承这个jwt策略的守卫，
// 最后 @UseGuard(JwtAuthGuard) 
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject() private readonly configService: ConfigService
    ) {
        console.log('jwtStrategy===', configService.get('JWT_SECRET'))
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || '',
        })
    }

    async validate(payload: any) {
        console.log('jwtStrategy_valid===', payload)
        return payload
    }
}
