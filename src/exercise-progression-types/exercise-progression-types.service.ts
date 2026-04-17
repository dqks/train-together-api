import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseProgressionType } from './exercise-progression-type.entity';

@Injectable()
export class ExerciseProgressionTypesService {
  constructor(
    @InjectRepository(ExerciseProgressionType)
    private exerciseTypeRepository: Repository<ExerciseProgressionType>,
  ) {}

  async getAll() {
    return this.exerciseTypeRepository.find();
  }
}
