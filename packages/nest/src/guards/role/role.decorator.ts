import { SetMetadata } from "@nestjs/common"
import { rolesEnum } from "src/utils/constants"

// 这里关系到挂载到 request.user.roles 这个key值
export const ROLES_KEY = 'roles'

// 这里传 args 的格式，关系着 RoleGuard 通过反射获取元数据的格式
export const Roles = (...args: rolesEnum[]) => SetMetadata(ROLES_KEY, args)