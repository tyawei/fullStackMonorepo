import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { rolesEnum } from 'src/utils/constants';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: Partial<CreateUserDto>) {
    // 检查 account 在数据库中是否存在
    // 不存在则加密password，判断是否admin赋予roles:admin角色，存入数据库

    const { account, password, roles, } = createUserDto

    if (!account || !password) {
      throw new HttpException('account or password does not exist', HttpStatus.BAD_REQUEST)
    }

    const user = await this.userRepository.findOne({ where: { account } })
    if (user) {
      // throw new HttpException('account already exist', HttpStatus.CONFLICT)
      return { success: 'account already exist' }
    }

    const hashPwd = await bcrypt.hash(password, 12)

    const dto = { account, password: hashPwd } as CreateUserDto;

    if (!roles && account === 'admin') dto.roles = rolesEnum.admin
    if (!roles && account !== 'admin') dto.roles = rolesEnum.user

    const u = this.userRepository.create(dto)

    await this.userRepository.save(u)

    return { success: 'created successfully' }
  }

  async findOne(userDto: Partial<CreateUserDto & {id: number}>) {
    return await this.userRepository.findOne({
      where: {...userDto},
    })
  }

  async update(updateUserDto: UpdateUserDto) {
    const { id, ...rest } = updateUserDto
    return await this.userRepository.update(
      { id }, 
      { ...rest }
    )
  }

  async remove(id: number) {
    const user = await this.findOne({id})
    if (!user) {
      throw new HttpException('the user does not exist', HttpStatus.NOT_FOUND)
    }
    return await this.userRepository.remove(user)
  }
}
