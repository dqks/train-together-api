import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { CustomRequest } from '../common/types/custom-request';
import { ExerciseTypesService } from '../exercise-types/exercise-types.service';
import { MusclesService } from '../muscles/muscles.service';
import { FilterExerciseDto } from './dto/filter-exercise.dto';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private exerciseTypeService: ExerciseTypesService,
    private muscleService: MusclesService,
    // @InjectRepository(ExerciseMuscle)
    // private exerciseMuscleRepository: Repository<ExerciseMuscle>,
  ) {}

  async findAllDefault(filter: FilterExerciseDto) {
    const hasMuscleFilter = filter.primaryMuscles?.length;
    const hasEquipmentFilter = filter.equipmentId;

    const query = this.exerciseRepository
      .createQueryBuilder('exercise')
      .select(['exercise.id', 'exercise.name', 'exercise.image'])
      .leftJoinAndSelect('exercise.exerciseMuscles', 'em')
      .leftJoinAndSelect('em.muscle', 'muscle')
      .leftJoinAndSelect('exercise.equipment', 'equipment')
      .orderBy('exercise.name', 'ASC')
      .where('exercise.userId IS NULL');

    if (hasEquipmentFilter) {
      query.andWhere('equipment.id = :equipmentId', {
        equipmentId: filter.equipmentId,
      });
    }

    if (hasMuscleFilter) {
      query
        .andWhere('em.muscleId IN (:...muscleIds)', {
          muscleIds: filter.primaryMuscles,
        })
        .andWhere('em.isPrimary = true');
    }

    const exercises = await query.getMany();

    return exercises.map((e) => ({
      id: e.id,
      name: e.name,
      image: e.image,
      // equipment:
      //   e.equipment?.map((eq) => ({
      //     id: eq.id,
      //     name: eq.name,
      //     nameEng: eq.nameEng,
      //   })) || [],
      muscles:
        e.exerciseMuscles?.map((m) => ({
          id: m.muscle.id,
          name: m.muscle.name,
          nameEng: m.muscle.nameEng,
          isPrimary: m.isPrimary,
        })) || [],
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

  async findOne(id: number, req: CustomRequest) {
    const exercise = await this.exerciseRepository.findOne({ where: { id } });

    if (!exercise) {
      throw new HttpException(
        { status: ['Упражнение не найдено'] },
        HttpStatus.NOT_FOUND,
      );
    }

    if (exercise.userId && exercise.userId !== req.user.userId) {
      throw new HttpException(
        { status: ['Нельзя просматривать упражнение другого пользователя'] },
        HttpStatus.FORBIDDEN,
      );
    }

    return exercise;
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
