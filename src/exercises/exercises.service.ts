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
import { AppService } from '../app.service';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private exerciseTypeService: ExerciseTypesService,
    private muscleService: MusclesService,
    private exerciseMusclesService: ExercisesMusclesService,
    private appService: AppService,
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

    // Составление запроса к БД
    const query = this.exerciseRepository
      .createQueryBuilder('exercise')
      .select(['exercise.id', 'exercise.name', 'exercise.image'])
      .leftJoinAndSelect('exercise.exerciseMuscles', 'em')
      .leftJoinAndSelect('em.muscle', 'muscle')
      .leftJoinAndSelect('exercise.equipment', 'equipment')
      // .orderBy('exercise.name', 'ASC')
      .where('exercise.userId IS NULL');

    // Если есть query параметр оборудования
    if (hasEquipmentFilter) {
      query.andWhere('equipment.id = :equipmentId', {
        equipmentId: filter.equipmentId,
      });
    }

    // Если есть query параметр мышечных групп
    if (hasMuscleFilter) {
      // query
      //   .andWhere('em.muscleId IN (:...muscleIds)', {
      //     muscleIds: filter.primaryMuscles,
      //   })
      //   .andWhere('em.isPrimary = true');
      const subQuery = this.exerciseRepository
        .createQueryBuilder('e')
        .select('e.id')
        .innerJoin('e.exerciseMuscles', 'em_filter')
        .where('em_filter.muscleId IN (:...muscleIds)', {
          muscleIds: filter.primaryMuscles,
        })
        .andWhere('em_filter.isPrimary = true');

      query.andWhere(`exercise.id IN (${subQuery.getQuery()})`);
      query.setParameters(subQuery.getParameters());
    }

    if (filter.name) {
      query.andWhere(`exercise.name ILIKE '%${filter.name}%'`);
    }

    query.orderBy('exercise.name', 'ASC');

    // Выполнение запроса
    const exercises = await query.getMany();

    // Преобразование ответа
    return exercises.map((e) => ({
      id: e.id,
      name: e.name,
      image: this.appService.getImageUrl(e.image),
      primaryMuscle: e.exerciseMuscles.reduce((acc, m) => {
        if (m.isPrimary) {
          return {
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          };
        }
        return acc;
      }, null),
      secondaryMuscles:
        e?.exerciseMuscles
          ?.filter((m) => !m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          })) || [],
    }));
  }

  async getMy(req: CustomRequest) {
    // Создание и выполнение запроса
    const myExercises = await this.exerciseRepository.find({
      select: {
        id: true,
        name: true,
        image: true,
        exerciseMuscles: true,
      },
      order: { name: 'ASC' },
      where: { userId: req.user.userId },
      relations: ['exerciseMuscles', 'exerciseMuscles.muscle'],
    });

    // Преобразование ответа
    return myExercises.map((e) => ({
      id: e.id,
      name: e.name,
      image: this.appService.getImageUrl(e.image),
      primaryMuscle: e.exerciseMuscles.reduce((acc, m) => {
        if (m.isPrimary) {
          return {
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          };
        }
        return acc;
      }, null),
      secondaryMuscles:
        e.exerciseMuscles
          ?.filter((m) => !m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          })) || [],
    }));
  }

  async findOne(id: number, req: CustomRequest) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: [
        'equipment',
        'exerciseMuscles',
        'exerciseMuscles.muscle',
        'exerciseProgressionType',
      ],
    });

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

    return {
      id: exercise.id,
      name: exercise.name,
      image: this.appService.getImageUrl(exercise.image),
      description: exercise.description,
      userId: exercise.userId,
      advice: exercise.advice,
      technique: exercise.technique,
      primaryMuscle: exercise.exerciseMuscles.reduce((acc, m) => {
        if (m.isPrimary) {
          return {
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          };
        }
        return acc;
      }, null),
      secondaryMuscles:
        exercise.exerciseMuscles
          ?.filter((m) => !m.isPrimary)
          .map((m) => ({
            id: m.muscle.id,
            name: m.muscle.name,
            nameEng: m.muscle.nameEng,
          })) || [],
      equipment: exercise.equipment[0],
      exerciseProgressionType: exercise.exerciseProgressionType,
    };
  }

  async getUserExercises(userId: number) {
    return this.exerciseRepository.find({ where: { userId } });
  }

  async createExercise(
    dto: CreateExerciseDto,
    req: CustomRequest,
    image: string | null,
  ) {
    const userId = req.user.userId;
    // const userId = 85;

    // Получаем все упражнения пользователя
    const userExercises = await this.getUserExercises(userId);

    // Проверка на кол-во упражнений, максимум 7
    if (userExercises.length >= 7) {
      throw new HttpException(
        'У пользователя может быть максимум 7 упражнений',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Основная мышца не может быть во второстепенных
    if (dto.secondaryMuscleIds.includes(dto.primaryMuscleId)) {
      throw new BadRequestException(
        'Основная мышечная группа не может быть во второстепенных',
      );
    }

    // Проверка на существование всех сущностей
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

    // Создание упражнения
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

    // Добавляем упражнению мышцы
    await this.exerciseMusclesService.createExerciseMuscles(
      insertedExercise.id,
      primaryMuscle.id,
      secondaryMuscles.map((m) => m.id),
    );

    // Возвращаем ответ
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
    // const userId = 85;
    const userId = req.user.userId;
    console.log(dto);

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
      if (dto?.secondaryMuscleIds?.includes(dto?.primaryMuscleId)) {
        throw new BadRequestException(
          'Дополнительные мышечные группы не могут содержать основную',
        );
      }

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

    if (dto.secondaryMuscleIds) {
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

      if (dto.secondaryMuscleIds?.length > 0) {
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

    console.log(exercises);

    // if (exerciseIds.length !== exercises.length) {
    //   return false;
    // }

    for (const exercise of exercises) {
      if (exercise.userId !== null && exercise.userId !== userId) {
        return false;
      }
    }

    return true;
  }
}
