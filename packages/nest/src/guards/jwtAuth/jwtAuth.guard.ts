import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Jwt认证流程：
// 认证模块注册 jwt 策略：(PassportModule.register)
// jwt 模块注册 jwt 策略的配置
// 定义 jwt对应的认证策略细节（jwt.strategy.ts，validate 方法返回挂载到 user 属性上的对象）
// jwt.strategy.ts 通过providers 全局注入，AuthGuard('jwt') 成为一个使用 jwt策略的认证守卫
// 然后定义一个 JwtAuthGuard 继承这个jwt策略的守卫，
// 最后 @UseGuard(JwtAuthGuard) 
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * 注意：在Auth模块内，PassportStrategy 的构造/初始化会调用 passport.use(...)，把策略实例全局注册；
 * 而Auth模块之外（如JwtAuthGuard定义）AuthGuard('jwt') 在运行时通过 passport 查找该名字的策略并执行。
这里为什么不需要 exports  JwtStrategy：
Nest 的 providers 只要在应用启动时被实例化（模块被导入），策略就已注册到 passport，全局可用；
不需要模块对外导出类供其他模块注入。
 * 
 * 
*/