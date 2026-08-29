import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return await this.userRepository.save(user)
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
