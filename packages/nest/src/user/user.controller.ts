import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesPipe } from 'src/pipes/roles-pipe';
import { JwtAuthGuard } from 'src/guards/jwtAuth/jwtAuth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/guards/role/role.decorator';
import { rolesEnum } from 'src/utils/constants';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(rolesEnum.admin)
  @Post('/create')
  async create(@Body(new RolesPipe()) createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  // @Roles(rolesEnum.admin, rolesEnum.user)
  @Roles(rolesEnum.user)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne({id});
    const { refreshTokenHash, password, ...rest } = user || {}
    if (user) return rest;
    return user;
  }

  @Roles(rolesEnum.admin, rolesEnum.user)
  @Post('/update')
  update(@Body(new RolesPipe()) updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @Roles(rolesEnum.admin)
  @Post('/delete')
  remove(@Body() idObj: Pick<UpdateUserDto, 'id'>) {
    return this.userService.remove(idObj.id);
  }
}
