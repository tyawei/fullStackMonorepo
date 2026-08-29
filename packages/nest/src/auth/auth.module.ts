import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt"
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "src/strategies/jwt.strategy";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { CryptoService } from "src/crypto/crypto.service";

@Module({
    // 注意：已经导入的UserModule中exports已经导出了UserService，这里providers 不需要再提供
    // configService 也不需要这里providers 提供，因为注册ConfigModule声明了全局
    imports: [
        UserModule,
        ConfigModule,
        // 引入认证模块，注册jwt 策略
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // 引入jwt模块，制定jwt策略具体规则
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '60Sec' }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, CryptoService],
    exports: []
})

export class AuthModule {}