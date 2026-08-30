import { rolesEnum } from "src/utils/constants";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    account: string;

    @Column()
    password: string;

    @Column({
        default: rolesEnum.user,
        comment: 'admin,user is a example'
    })
    roles: string;

    @CreateDateColumn({
        name: 'update_at',
    })
    updateAt: Date;

    @Column({
        name: 'freshtokenhash',
        default: ''
    })
    refreshTokenHash: string;
}
