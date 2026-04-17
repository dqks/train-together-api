import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseType } from './exercise-type.entity';

@Injectable()
export class ExerciseTypesService {
  constructor(
    @InjectRepository(ExerciseType)
    private exerciseTypeRepository: Repository<ExerciseType>,
  ) {}

  async getAll() {
    return this.exerciseTypeRepository.find();
  }
}
