import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muscle } from './muscle.entity';

@Injectable()
export class MusclesService {
  constructor(
    @InjectRepository(Muscle)
    private muscleRepository: Repository<Muscle>,
  ) {}

  async getAll() {
    return this.muscleRepository.find();
  }
}
