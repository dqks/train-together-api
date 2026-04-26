import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { CustomRequest } from '../common/types/custom-request';
import { ExerciseTypesService } from '../exercise-types/exercise-types.service';
import { MusclesService } from '../muscles/muscles.service';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private exerciseTypeService: ExerciseTypesService,
    private muscleService: MusclesService,
  ) {}

  async findAllDefault() {
    // const exercises = await this.exerciseRepository.find({
    //   order: { name: 'ASC' },
    //   where: { userId: IsNull() },
    //   relations: ['exerciseMuscles', 'exerciseMuscles.muscle'],
    // });
    //
    // console.log(exercises);

    // return await this.exerciseRepository.find({
    //   select: {
    //     id: true,
    //     name: true,
    //     image: true,
    //     muscles: true,
    //   },
    //   order: { name: 'ASC' },
    //   where: { userId: IsNull() },
    //   relations: ['muscles'],
    // });

    const exercises = await this.exerciseRepository.find({
      select: {
        id: true,
        name: true,
        image: true,
        muscles: true,
      },
      order: { name: 'ASC' },
      where: { userId: IsNull() },
      relations: ['exerciseMuscles', 'exerciseMuscles.muscle'],
    });

    return exercises.map((e) => ({
      id: e.id,
      name: e.name,
      image: e.image,
      muscles: e.exerciseMuscles.map((m) => ({
        id: m.muscle.id,
        name: m.muscle.name,
        nameEng: m.muscle.nameEng,
        isPrimary: m.isPrimary,
      })),
    }));
  }

  async getMy(req: CustomRequest) {
    return await this.exerciseRepository.find({
      select: {
        id: true,
        name: true,
        image: true,
        muscles: true,
      },
      order: { name: 'ASC' },
      where: { userId: req.user.userId },
      relations: ['muscles'],
    });
  }

  async findOne(id: number) {
    return await this.exerciseRepository.findOne({ where: { id } });
  }

  async getUserExercises(userId: number) {
    return this.exerciseRepository.find({ where: { userId } });
  }

  async createExercise(
    createExerciseDto: CreateExerciseDto,
    req: CustomRequest,
  ) {
    const userId = req.user.userId;

    const userExercises = await this.getUserExercises(userId);

    if (userExercises.length >= 7) {
      throw new HttpException(
        'У пользователя может быть максимум 7 упражнений',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userExerciseType =
      await this.exerciseTypeService.getUserProgressionType();

    if (!userExerciseType) {
      throw new HttpException(
        'Тип упражнения не найден',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const muscles = await this.muscleService.getAll();

    const newExercise = this.exerciseRepository.create({
      userId,
      name: createExerciseDto.name,
      advice: '',
      description: '',
      technique: '',
      exerciseTypeId: userExerciseType.id,
      exerciseProgressionTypeId: createExerciseDto.exerciseProgressionTypeId,
      muscles: [muscles[0]],
    });

    await this.exerciseRepository.save(newExercise);

    return {
      success: true,
    };
  }

  async deleteExercise(exerciseId: number, req: CustomRequest) {
    try {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });

      console.log(exercise);

      if (exercise?.userId === null) {
        throw new HttpException(
          'Упражнение не пользователя',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.exerciseRepository.delete(exerciseId);

      return { success: true };
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
