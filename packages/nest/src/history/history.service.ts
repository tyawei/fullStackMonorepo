import { Injectable } from '@nestjs/common';
// import { CreateHistoryDto } from './dto/create-history.dto';
// import { UpdateHistoryDto } from './dto/update-history.dto';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HistoryService {

  constructor(
    @InjectRepository(History) private readonly historyRepository: Repository<History>
  ) {}


  async findAll() {
    return await this.historyRepository.find()
  }

}
