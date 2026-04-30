import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgramDay } from './training-program-day.entity';
import { AddTrainingProgramDetailsDto } from '../training-programs/dto/add-details.dto';

@Injectable()
export class TrainingProgramDaysService {
  constructor(
    @InjectRepository(TrainingProgramDay)
    private trainingProgramDayRepository: Repository<TrainingProgramDay>,
  ) {}

  async getDaysOfProgram(programId: number) {
    return this.trainingProgramDayRepository.find({ where: { id: programId } });
  }

  async countDaysOfProgram(programId: number) {
    return this.trainingProgramDayRepository.count({
      where: { id: programId },
    });
  }

  checkIfDaysUnique(dayDetails: AddTrainingProgramDetailsDto) {
    const dayIds = dayDetails.details.map((d) => d.dayId);
    const daySet = new Set(dayIds);

    return daySet.size === dayIds.length;
  }
}
