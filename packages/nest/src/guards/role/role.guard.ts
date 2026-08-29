import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { rolesEnum } from "src/utils/constants";
import { ROLES_KEY } from "./role.decorator";
import type { Request } from 'express'

// 通过反射对象 reflector 获取controller端点上装饰器定义的角色元数据（表示此端点什么角色才能请求）
// 获取 request.user.roles (代表此用户拥有的角色)
// 对比两者
@Injectable()
export class RoleGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<rolesEnum[]>(ROLES_KEY, context.getClass())
        if (!requiredRoles || !requiredRoles.length) {
            return true
        }

        const request = context.switchToHttp().getRequest<Request>()
        console.log('roles===', request.user)
        const roles = request?.user? (request.user[ROLES_KEY] || []) : []

        const result = requiredRoles.some(r => roles.includes(r))

        return result
    }

}