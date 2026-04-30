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
import { join } from 'path';
import { unlink } from 'fs/promises';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';
import { AddTrainingProgramDetailsDto } from '../training-programs/dto/add-details.dto';

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
    @InjectRepository(ExerciseMuscle)
    private exerciseMuscleRepository: Repository<ExerciseMuscle>,
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
    dto: CreateExerciseDto,
    req: CustomRequest,
    image: string | null,
  ) {
    const userId = 85;
    // const userId = req.user.userId;

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
      image: image ? image : undefined,
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

  async updateExercise(
    id: number,
    req: CustomRequest,
    dto: UpdateExerciseDto,
    image: string | null,
  ) {
    const userId = 85;
    // const userId = req.user.userId

    const data = {
      name: dto.name || undefined,
      exerciseProgressionTypeId: dto.exerciseProgressionTypeId || undefined,
      equipment: undefined as Equipment[] | undefined,
    };

    if (dto.equipmentId) {
      const equipment = await this.equipmentRepository.findOneBy({
        id: dto.equipmentId,
      });
      if (!equipment) {
        throw new NotFoundException('Оборудование не найдено');
      }
      data.equipment = [equipment];
    }

    const exercise = await this.exerciseRepository.preload({ id, ...data });

    if (!exercise) {
      throw new NotFoundException('Упражнение не найдено');
    }

    if (exercise.userId !== userId) {
      throw new BadRequestException('Упражнение не ваше');
    }

    if (dto.primaryMuscleId) {
      const primaryExerciseMuscle = await this.exerciseMuscleRepository.findOne(
        {
          where: {
            exerciseId: exercise.id,
            isPrimary: true,
          },
        },
      );

      if (!primaryExerciseMuscle) {
        throw new NotFoundException('Основной мышцы не существует');
      }

      const preloadedExerciseMuscle =
        await this.exerciseMuscleRepository.preload({
          id: primaryExerciseMuscle.id,
          muscleId: dto.primaryMuscleId,
          isPrimary: true,
        });

      if (preloadedExerciseMuscle) {
        await this.exerciseMuscleRepository.save(preloadedExerciseMuscle);
      }
    }

    if (dto.secondaryMuscleIds && dto.secondaryMuscleIds?.length > 0) {
      const secondaryMusclesCheck = await this.muscleRepository.findBy({
        id: In(dto.secondaryMuscleIds),
      });

      if (dto.secondaryMuscleIds.length !== secondaryMusclesCheck.length) {
        throw new NotFoundException('Дополнительные мышцы не найдены');
      }

      const secondaryExerciseMuscleIds =
        await this.exerciseMuscleRepository.find({
          where: {
            exerciseId: exercise.id,
            isPrimary: false,
          },
        });

      if (secondaryExerciseMuscleIds.length > 0) {
        await this.exerciseMuscleRepository.delete(secondaryExerciseMuscleIds);
      }

      const relations: ExerciseMuscle[] = [];

      for (const muscleId of dto.secondaryMuscleIds) {
        relations.push(
          this.exerciseMuscleRepository.create({
            exerciseId: exercise.id,
            muscleId,
            isPrimary: false,
          }),
        );
      }
      await this.exerciseMuscleRepository.save(relations);
    }

    if (image) {
      if (exercise.image) {
        const oldPath = join(process.cwd(), exercise.image);
        await unlink(oldPath).catch(console.error);
      }

      exercise.image = image;
    }

    await this.exerciseRepository.save(exercise);

    return { success: true };
  }

  async deleteExercise(exerciseId: number, req: CustomRequest) {
    try {
      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });

      if (exercise?.userId === null) {
        throw new HttpException(
          'Упражнение не пользователя',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (exercise?.image) {
        const oldPath = join(process.cwd(), exercise.image);
        await unlink(oldPath).catch(console.error);
      }

      await this.exerciseRepository.delete(exerciseId);

      return { success: true };
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Checking if exercises exists
  // And if exercises are user's
  async checkExercisesToAdd(dto: AddTrainingProgramDetailsDto, userId: number) {
    const exerciseIds: number[] = [];
    for (const day of dto.details) {
      day.exercises.forEach((exercise) => {
        exerciseIds.push(exercise.exerciseId);
      });
    }

    const exercises = await this.exerciseRepository.findBy({
      id: In(exerciseIds),
    });

    if (exerciseIds.length !== exercises.length) {
      return false;
    }

    for (const exercise of exercises) {
      if (exercise.userId !== null && exercise.userId !== userId) {
        return false;
      }
    }

    return true;
  }
}
