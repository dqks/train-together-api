import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram } from './training-programs.entity';

@Injectable()
export class TrainingProgramsService {
  constructor(
    @InjectRepository(TrainingProgram)
    private exerciseRepository: Repository<TrainingProgram>,
  ) {}

  async getAllPublicTrainingPrograms() {
    return this.exerciseRepository.find({ where: { public: true } });
  }
}
