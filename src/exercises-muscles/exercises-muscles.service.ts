import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseMuscle } from './exercise-muscle.entity';

@Injectable()
export class ExercisesMusclesService {
  constructor(
    @InjectRepository(ExerciseMuscle)
    private exerciseMuscleRepository: Repository<ExerciseMuscle>,
  ) {}

  async createExerciseMuscles(
    exerciseId: number,
    primaryMuscleId: number,
    secondaryMuscleIds: number[],
  ) {
    const relations: ExerciseMuscle[] = [];

    relations.push(
      this.exerciseMuscleRepository.create({
        exerciseId,
        muscleId: primaryMuscleId,
        isPrimary: true,
      }),
    );

    for (const muscleId of secondaryMuscleIds) {
      relations.push(
        this.exerciseMuscleRepository.create({
          exerciseId,
          muscleId,
          isPrimary: false,
        }),
      );
    }

    await this.exerciseMuscleRepository.save(relations);
  }
}
