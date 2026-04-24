import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgramExercise } from './training-program-exercise.entity';

@Injectable()
export class TrainingProgramExercisesService {
  constructor(
    @InjectRepository(TrainingProgramExercise)
    private trainingProgramDayRepository: Repository<TrainingProgramExercise>,
  ) {}
}
