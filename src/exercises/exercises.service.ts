import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { Repository } from 'typeorm';
import { ExerciseResponse } from './exercise.response';
import { Muscle } from '../muscles/muscle.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { CustomRequest } from '../common/types/custom-request';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async findAll(): Promise<ExerciseResponse> {
    const exercise = await this.exerciseRepository.find({
      select: {
        id: true,
        name: true,
        image: true,
        exerciseMuscles: {
          id: true,
          muscle: true,
        },
      },
      order: { name: 'ASC' },
      relations: ['exerciseMuscles.muscle'],
    });

    return exercise.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      image: exercise.image,
      exerciseMuscles: exercise.exerciseMuscles.map((muscle) => ({
        id: muscle.id,
        name: muscle.muscle.name,
        nameEng: muscle.muscle.nameEng,
      })) as Muscle[],
    }));
  }

  async createExercise(
    createExerciseDto: CreateExerciseDto,
    req: CustomRequest,
  ) {
    const userId = req.user.userId;
    const newExercise = this.exerciseRepository.create({
      userId,
      name: createExerciseDto.name,
      advice: 'u',
      description: 'u',
      technique: 'u',
      exerciseTypeId: 1,
      exerciseProgressionTypeId: 1,
    });

    await this.exerciseRepository.save(newExercise);

    return {
      success: true,
    };
  }
}
