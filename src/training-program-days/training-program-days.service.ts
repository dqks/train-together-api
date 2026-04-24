import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgramDay } from './training-program-day.entity';

@Injectable()
export class TrainingProgramDaysService {
  constructor(
    @InjectRepository(TrainingProgramDay)
    private trainingProgramDayRepository: Repository<TrainingProgramDay>,
  ) {}
}
