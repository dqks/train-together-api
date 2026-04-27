import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { In, Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { CustomRequest } from '../common/types/custom-request';
import { ExerciseTypesService } from '../exercise-types/exercise-types.service';
import { MusclesService } from '../muscles/muscles.service';
import { FilterExerciseDto } from './dto/filter-exercise.dto';
import { Muscle } from '../muscles/muscle.entity';
import { Equipment } from '../equipment/equipment.entity';
import { ExerciseProgressionType } from '../exercise-progression-types/exercise-progression-type.entity';
import { ExercisesMusclesService } from '../exercises-muscles/exercises-muscles.service';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private exerciseTypeService: ExerciseTypesService,
    private muscleService: MusclesService,
    private exerciseMusclesService: ExercisesMusclesService,
    @InjectRepository(Muscle)
    private muscleRepository: Repository<Muscle>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(ExerciseProgressionType)
    private exerciseProgressionTypeRepository: Repository<ExerciseProgressionType>,
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

  async createExercise(dto: CreateExerciseDto, req: CustomRequest) {
    // const userId = 85;
    const userId = req.user.userId;

    const userExercises = await this.getUserExercises(userId);

    if (userExercises.length >= 7) {
      throw new HttpException(
        'У пользователя может быть максимум 7 упражнений',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.secondaryMuscleIds.includes(dto.primaryMuscleId)) {
      throw new BadRequestException(
        'Основная мышечная группа не может быть во второстепенных',
      );
    }

    const [primaryMuscle, secondaryMuscles, equipment, progressionType] =
      await Promise.all([
        this.muscleRepository.findOneBy({ id: dto.primaryMuscleId }),
        this.muscleRepository.findBy({ id: In(dto.secondaryMuscleIds) }),
        this.equipmentRepository.findOneBy({ id: dto.equipmentId }),
        this.exerciseProgressionTypeRepository.findOneBy({
          id: dto.exerciseProgressionTypeId,
        }),
      ]);

    if (!primaryMuscle)
      throw new NotFoundException('Основная мышечная группа не найдена');
    if (secondaryMuscles.length !== dto.secondaryMuscleIds.length) {
      throw new NotFoundException('Второстепенные мышцы не найдены');
    }
    if (!equipment) throw new NotFoundException('Оборудование не найдено');
    if (!progressionType)
      throw new NotFoundException('Тип прогрессии не найден');

    const userExerciseType =
      await this.exerciseTypeService.getUserExerciseType();

    const newExercise = this.exerciseRepository.create({
      userId,
      name: dto.name,
      advice: '',
      description: '',
      technique: '',
      exerciseTypeId: userExerciseType?.id,
      exerciseProgressionTypeId: dto.exerciseProgressionTypeId,
      equipment: [equipment],
    });

    const insertedExercise = await this.exerciseRepository.save(newExercise);

    await this.exerciseMusclesService.createExerciseMuscles(
      insertedExercise.id,
      primaryMuscle.id,
      secondaryMuscles.map((m) => m.id),
    );

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
