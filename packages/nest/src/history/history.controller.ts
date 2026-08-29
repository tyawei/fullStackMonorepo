import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from 'src/guards/jwtAuth/jwtAuth.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/guards/role/role.decorator';
import { rolesEnum } from 'src/utils/constants';
// import { CreateHistoryDto } from './dto/create-history.dto';
// import { UpdateHistoryDto } from './dto/update-history.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Roles(rolesEnum.admin)
  @Get('list')
  async findAll() {
    return await this.historyService.findAll();
  }

}
 