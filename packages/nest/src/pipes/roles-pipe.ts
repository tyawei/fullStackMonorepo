import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { rolesEnum } from "src/utils/constants";

@Injectable()
export class RolesPipe implements PipeTransform {

    transform(value: any, metadata: ArgumentMetadata) {
        if (
            !value || 
            typeof value !== 'object' || 
            !value.roles ||     // 空值会默认为 user 角色
            metadata.type !== 'body' // body, query, param ...
        ) return value;

        const { roles } = value
        const { user, admin } = rolesEnum
        const errMsg = 'roles field is incorrect'
        const errCode = HttpStatus.BAD_REQUEST

        if (typeof roles !== 'string') throw new HttpException(errMsg, errCode);

        // 把roles 中排除 user admin 字符串以外，还剩其他字符串，就不符合规则
        const filteredRoles = roles.split(',').filter(r => r !== user && r !== admin)

        if (filteredRoles.length) throw new HttpException(errMsg, errCode);
        
        return value 
    }
}