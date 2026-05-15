import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { CustomRequest } from '../common/types/custom-request';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { TrainingProgramDay } from '../training-program-days/training-program-day.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { AddTrainingProgramDetailsDto } from './dto/add-details.dto';
import { TrainingProgramDaysService } from '../training-program-days/training-program-days.service';
import { TrainingProgramExercise } from '../training-program-exercises/training-program-exercise.entity';
import { ExercisesService } from '../exercises/exercises.service';
import {
  Difficulties,
  FilterProgramDto,
  Goals,
  SortOptions,
} from './dto/filter-program.dto';
import { Difficulty } from '../difficulties/difficulty.entity';
import { Goal } from '../goals/goal.entity';
import { UpdateProgramDto } from './dto/update-program.dto';
import { LikedTrainingPrograms } from '../liked-training-programs/liked-training-program.entity';
import { FollowedTrainingProgram } from '../followed-training-programs/followed-training-programs.entity';
import { AppService } from '../app.service';

enum GoalValues {
  MASS = 'Muscle gain',
  STRENGTH = 'Strength',
  ENDURANCE = 'Endurance',
  ATHLETICISM = 'Athleticism',
  OTHER = 'Other',
}

enum DifficultyValues {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

@Injectable()
export class TrainingProgramsService {
  constructor(
    @InjectRepository(TrainingProgram)
    private programRepository: Repository<TrainingProgram>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UsersService,
    @InjectRepository(TrainingProgramDay)
    private programDaysRepository: Repository<TrainingProgramDay>,
    private programDaysService: TrainingProgramDaysService,
    private appService: AppService,
    @InjectRepository(TrainingProgramExercise)
    private programExercisesRepository: Repository<TrainingProgramExercise>,
    private exerciseService: ExercisesService,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(Difficulty)
    private difficultyRepository: Repository<Difficulty>,
    @InjectRepository(LikedTrainingPrograms)
    private likedProgramsRepository: Repository<LikedTrainingPrograms>,
    @InjectRepository(FollowedTrainingProgram)
    private followedProgramsRepository: Repository<FollowedTrainingProgram>,
  ) {}

  async getAllPublicTrainingPrograms(dto: FilterProgramDto) {
    //Создание запроса
    const query = this.programRepository
      .createQueryBuilder('program')
      .select([
        'program.id as id',
        'program.name as name',
        'program.description as description',
        // 'program.created_at as createdAt',
        'program.image as imageUrl',
        'g.name as goalName',
        'g.nameEng as goalNameEng',
        'd.nameEng as diffNameEng',
        'd.name as diffName',
        'u.nickname as userNickname',
        'u.id as userId',
      ])
      .where('program.isPublic = :isPublic', { isPublic: true })
      .leftJoinAndSelect('program.user', 'u')
      .leftJoinAndSelect('program.goal', 'g')
      .leftJoinAndSelect('program.difficulty', 'd');

    // Если есть query параметр
    // для фильтрации по цели
    if (dto.goal) {
      switch (dto.goal) {
        case Goals.ATHLETICISM:
          query.andWhere('g.name_en = :goalName', {
            goalName: GoalValues.ATHLETICISM,
          });
          break;
        case Goals.MASS:
          query.andWhere('g.name_en = :goalName', {
            goalName: GoalValues.MASS,
          });
          break;
        case Goals.STRENGTH:
          query.andWhere('g.name_en = :goalName', {
            goalName: GoalValues.STRENGTH,
          });
          break;
        case Goals.ENDURANCE:
          query.andWhere('g.name_en = :goalName', {
            goalName: GoalValues.ENDURANCE,
          });
          break;
        case Goals.OTHER:
          query.andWhere('g.nameEn = :goalName', {
            goalName: GoalValues.OTHER,
          });
          break;
      }
    }

    // Если есть query параметр
    // для фильтрации по сложности
    if (dto.difficulty) {
      switch (dto.difficulty) {
        case Difficulties.BEGINNER:
          query.andWhere('d.name_en = :diffName', {
            diffName: DifficultyValues.BEGINNER,
          });
          break;
        case Difficulties.INTERMEDIATE:
          query.andWhere('d.name_en = :diffName', {
            diffName: DifficultyValues.INTERMEDIATE,
          });
          break;
        case Difficulties.ADVANCED:
          query.andWhere('d.name_en = :diffName', {
            diffName: DifficultyValues.ADVANCED,
          });
          break;
      }
    }

    // Если есть query параметр
    // для фильтрации по кол-ву дней
    if (dto.frequency) {
      query.andWhere(
        (subQuery) => {
          const sub = subQuery
            .subQuery()
            .select('COUNT(*)')
            .from('training_programs_days', 'days')
            .where('days.id_training_program = program.id')
            .getQuery();

          return `${sub} = :frequency`;
        },
        { frequency: dto.frequency },
      );
    }

    const sortBy = dto.sortOption || 'new';

    query.addSelect((subQuery) => {
      return subQuery
        .select('COUNT(*)')
        .from('followed_training_programs', 'follow')
        .where('follow.id_training_program = program.id');
    }, 'followerscount');
    // Применение сортировки
    if (sortBy === SortOptions.POPULAR) {
      query.orderBy('followerscount', 'DESC');
    } else {
      query.orderBy('program.created_at', 'DESC');
    }

    // Подсчет количества дней в программе
    query.addSelect((subQuery) => {
      return subQuery
        .select('COUNT(*)')
        .from('training_programs_days', 'days')
        .where('days.id_training_program = program.id');
    }, 'daysAmount');

    // Выполнение запроса
    const trainingPrograms = await query.getRawMany();

    // Преобразование запроса
    return trainingPrograms.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: this.appService.getImageUrl(p.imageurl),
      goal: {
        name: p.goalname,
        nameEng: p.goalnameeng,
      },
      difficulty: {
        name: p.diffname,
        nameEng: p.diffnameeng,
      },
      user: {
        nickname: p.usernickname,
      },
      followersCount: p.followerscount,
      daysAmount: p.daysAmount,
    }));
  }

  async getTrainingProgram(id: number, req: CustomRequest) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }
    //Создание запроса
    const p = await this.programRepository.findOne({
      where: { id },
      relations: [
        'goal',
        'difficulty',
        'user',
        'days',
        'days.day',
        'days.exercises',
        'days.exercises.exercise',
        'days.exercises.exercise.exerciseMuscles',
        'days.exercises.exercise.exerciseMuscles.muscle',
      ],
    });

    // Если программа не найдена или она не публичная,
    // или она не публичная, но не текущего пользователя
    if (!p || (!p.isPublic && p.userId !== req.user.userId)) {
      throw new HttpException(
        { status: ['Программа не найдена'] },
        HttpStatus.NOT_FOUND,
      );
    }

    let isFollowed = false;

    const user = await this.userService.getUserByEmailWithFollowed(
      req.user.email,
    );

    if (user?.followedPrograms.find((program) => program.id === p.id)) {
      isFollowed = true;
    }

    const userProgramsCount = await this.userService.countUserPrograms(
      p.userId,
    );
    const programFollowsCount = await this.followedProgramsRepository.count({
      where: { trainingProgram: { id: p.id } },
    });

    return {
      id: p.id,
      name: p.name,
      isFollowed,
      description: p.description,
      createdAt: p.createdAt,
      imageUrl: this.appService.getImageUrl(p.image),
      followsCount: programFollowsCount,
      goal: {
        name: p.goal.name,
        nameEng: p.goal.nameEng,
      },
      difficulty: {
        name: p.difficulty.name,
        nameEng: p.difficulty.nameEng,
      },
      user: {
        id: p.user.id,
        nickname: p.user.nickname,
        avatarUrl: p.user.avatar,
        programsCount: userProgramsCount,
      },
      days: p?.days?.map((day: TrainingProgramDay) => ({
        id: day.id,
        name: day.name,
        description: day.description,
        day: day.day,
        exercises: day?.exercises?.map((exercise) => ({
          id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          exerciseOrder: exercise.exerciseOrder,
          exercise: {
            primaryMuscle: exercise.exercise.exerciseMuscles.find(
              (em) => em.isPrimary,
            )?.muscle,
            id: exercise.exercise.id,
            name: exercise.exercise.name,
            image: exercise.exercise.image,
          },
        })),
      })),
    };
  }

  async getMyFavouriteTrainingPrograms(req: CustomRequest) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
      relations: [
        'followedProgramsRelations',
        'followedProgramsRelations.user',
        'followedProgramsRelations.trainingProgram',
        'followedProgramsRelations.trainingProgram.goal',
        'followedProgramsRelations.trainingProgram.difficulty',
        'followedProgramsRelations.trainingProgram.user',
      ],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const programIds = user.followedProgramsRelations.map(
      (ftp) => ftp.trainingProgram.id,
    );

    if (programIds.length === 0) {
      return [];
    }

    const followersCounts = await this.followedProgramsRepository
      .createQueryBuilder('follow')
      .select('follow.id_training_program', 'programId')
      .addSelect('COUNT(*)', 'count')
      .where('follow.id_training_program IN (:...programIds)', { programIds })
      .groupBy('follow.id_training_program')
      .getRawMany();

    const followersMap = new Map<number, number>();
    followersCounts.forEach((item) => {
      followersMap.set(Number(item.programId), Number(item.count));
    });

    return user?.followedProgramsRelations
      .map((ftp) => ({
        id: ftp.trainingProgram.id,
        name: ftp.trainingProgram.name,
        description: ftp.trainingProgram.description,
        createdAt: ftp.createdAt,
        imageUrl: this.appService.getImageUrl(ftp.trainingProgram.image),
        goal: {
          name: ftp.trainingProgram.goal.name,
          nameEng: ftp.trainingProgram.goal.nameEng,
        },
        difficulty: {
          name: ftp.trainingProgram.difficulty.name,
          nameEng: ftp.trainingProgram.difficulty.nameEng,
        },
        user: {
          id: ftp.trainingProgram.user.id,
          nickname: ftp.trainingProgram.user.nickname,
        },
        followersCount: followersMap.get(ftp.trainingProgram.id) || 0,
      }))
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }

  async subscribeTrainingPrograms(id: number, req: CustomRequest) {
    const email = req.user.email;

    const user = await this.userService.getUserByEmailWithFollowed(email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const trainingProgram = await this.programRepository.findOne({
      where: { id },
    });

    if (!trainingProgram) {
      throw new NotFoundException('Неверный id программы');
    }

    if (!user.followedPrograms) {
      user.followedPrograms = [];
    }

    if (user.followedPrograms.find((program) => program.id === id)) {
      throw new BadRequestException('Пользователь уже подписан на программу');
    }

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'followedPrograms')
      .of(user)
      .add(id);

    return { success: true };
  }

  async unsubscribeTrainingPrograms(id: number, req: CustomRequest) {
    const email = req.user.email;

    const user = await this.userService.getUserByEmailWithFollowed(email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const trainingProgram = await this.programRepository.findOne({
      where: { id },
    });

    if (!trainingProgram) {
      throw new NotFoundException('Неверный id программы');
    }

    if (!user.followedPrograms) {
      user.followedPrograms = [];
    }

    if (user.followedPrograms.find((program) => program.id === id)) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'followedPrograms')
        .of(user)
        .remove(id);

      return { success: true };
    }
    throw new BadRequestException('Пользователь не подписан на программу');
  }

  async getMyTrainingPrograms(req: CustomRequest) {
    // Получение id пользователя из кук
    const userId: number = req.user.userId;
    // Создание и выполнение запроса
    const programs = await this.programRepository.find({
      select: ['id', 'name', 'description', 'userId', 'createdAt', 'image'],
      relations: ['goal', 'difficulty'],
      where: { userId },
      order: { createdAt: 'desc' },
    });

    if (programs.length === 0) {
      return [];
    }

    // Получаем ID всех программ
    const programIds = programs.map((p) => p.id);

    // Подсчитываем количество подписчиков для каждой программы
    const followersCounts = await this.followedProgramsRepository
      .createQueryBuilder('follow')
      .select('follow.id_training_program', 'programId')
      .addSelect('COUNT(*)', 'count')
      .where('follow.id_training_program IN (:...programIds)', { programIds })
      .groupBy('follow.id_training_program')
      .getRawMany();

    // Создаём мапу programId → followersCount
    const followersMap = new Map<number, number>();
    followersCounts.forEach((item) => {
      followersMap.set(Number(item.programId), Number(item.count));
    });

    // Преобразование результата
    return programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      userId: p.userId,
      createdAt: p.createdAt,
      goal: {
        name: p.goal.name,
        nameEng: p.goal.nameEng,
      },
      difficulty: {
        name: p.difficulty.name,
        nameEng: p.difficulty.nameEng,
      },
      imageUrl: this.appService.getImageUrl(p.image),
      followersCount: followersMap.get(p.id) || 0,
    }));
  }

  async getUserTrainingPrograms(id: string) {
    // Создание и выполнение запроса
    const programs = await this.programRepository.find({
      select: [
        'id',
        'name',
        'description',
        'userId',
        'createdAt',
        'image',
        'isPublic',
      ],
      relations: ['goal', 'difficulty', 'user'],
      where: { userId: Number(id), isPublic: true },
      order: { createdAt: 'desc' },
    });

    if (programs.length === 0) {
      return [];
    }

    // Получаем ID всех программ
    const programIds = programs.map((p) => p.id);

    // Подсчитываем количество подписчиков для каждой программы
    const followersCounts = await this.followedProgramsRepository
      .createQueryBuilder('follow')
      .select('follow.id_training_program', 'programId')
      .addSelect('COUNT(*)', 'count')
      .where('follow.id_training_program IN (:...programIds)', { programIds })
      .groupBy('follow.id_training_program')
      .getRawMany();

    // Создаём мапу programId → followersCount
    const followersMap = new Map<number, number>();
    followersCounts.forEach((item) => {
      followersMap.set(Number(item.programId), Number(item.count));
    });

    // Преобразование результата
    return programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      user: {
        id: p.user.id,
        nickname: p.user.nickname,
      },
      createdAt: p.createdAt,
      imageUrl: this.appService.getImageUrl(p.image),
      followersCount: followersMap.get(p.id) || 0,
      goal: {
        name: p.goal.name,
        nameEng: p.goal.nameEng,
      },
      difficulty: {
        name: p.difficulty.name,
        nameEng: p.difficulty.nameEng,
      },
    }));
  }

  async createTrainingProgram(
    dto: CreateProgramDto,
    req: CustomRequest,
    image: string | null,
  ) {
    const userId = req.user.userId;
    // const userId = 85;

    const [goal, difficulty] = await Promise.all([
      this.goalRepository.findOneBy({ id: dto.goalId }),
      this.difficultyRepository.findOneBy({ id: dto.diffId }),
    ]);

    if (!goal) {
      throw new NotFoundException({ status: 'Цель не найдена' });
    }

    if (!difficulty) {
      throw new NotFoundException({ status: 'Сложность не найдена' });
    }

    const newProgram = this.programRepository.create({
      userId: userId,
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic === 'true',
      image: image ? image : undefined,
      goal,
      difficulty,
    });

    await this.programRepository.save(newProgram);

    return {
      success: true,
    };
  }

  async deleteTrainingProgram(id: number, req: CustomRequest) {
    try {
      const program = await this.programRepository.findOne({ where: { id } });

      if (program?.userId !== req.user.userId) {
        throw new HttpException(
          'Программа не пользователя',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (program.image) {
        const oldPath = join(process.cwd(), program.image);
        await unlink(oldPath).catch(console.error);
      }

      await this.programRepository.delete(id);
      return { success: true };
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addTrainingProgramDetails(
    id: number,
    req: CustomRequest,
    dto: AddTrainingProgramDetailsDto,
  ) {
    const userId = req.user.userId;
    // const userId = 85;
    const data = dto.details;

    const areDaysUniq = this.programDaysService.checkIfDaysUnique(dto);

    if (!areDaysUniq) {
      throw new BadRequestException({
        status: 'В программе не может быть одинаковых дней',
      });
    }

    const exercisesExist = await this.exerciseService.checkExercisesToAdd(
      dto,
      userId,
    );

    if (!exercisesExist) {
      throw new NotFoundException({
        status:
          'Упражнения не найдены, либо они принадлежат другому пользователю',
      });
    }

    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['days'],
    });

    if (program?.userId !== userId) {
      throw new ForbiddenException({ status: 'Программа не ваша' });
    }

    if (program.days.length > 0) {
      await this.programDaysRepository.remove(program.days);
    }

    let days: TrainingProgramDay[] = [];

    for (const detail of data) {
      days.push(
        this.programDaysRepository.create({
          trainingProgramId: program.id,
          name: detail.name || undefined,
          description: detail.description || undefined,
          dayId: detail.dayId,
        }),
      );

      days = await this.programDaysRepository.save(days);

      const exercises: TrainingProgramExercise[] = [];
      for (const e of detail.exercises) {
        exercises.push(
          this.programExercisesRepository.create({
            trainingProgramDayId: days[0].id,
            exerciseId: e.exerciseId,
            exerciseOrder: e.exerciseOrder,
            reps: e.reps,
            sets: e.sets,
          }),
        );
      }

      await this.programExercisesRepository.save(exercises);

      days = [];
    }

    return { success: true };
  }

  async getCreateInfo() {
    const goals = await this.goalRepository.find({
      select: ['id', 'name', 'nameEng', 'sortOrder'],
      order: { sortOrder: 'ASC' },
    });
    const difficulties = await this.difficultyRepository.find({
      select: ['id', 'name', 'nameEng', 'level'],
      order: { level: 'ASC' },
    });

    return { goals, difficulties };
  }

  async updateTrainingProgram(
    dto: UpdateProgramDto,
    req: CustomRequest,
    imagePath: string | null,
    programId: number,
  ) {
    const userId = req.user.userId;
    // const userId = 85;

    const [goal, difficulty] = await Promise.all([
      this.goalRepository.findOneBy({ id: dto.goalId }),
      this.difficultyRepository.findOneBy({ id: dto.diffId }),
    ]);

    if (!goal) {
      throw new NotFoundException({ status: 'Цель не найдена' });
    }

    if (!difficulty) {
      throw new NotFoundException({ status: 'Сложность не найдена' });
    }

    const data = {
      ...dto,
      isPublic: dto.isPublic === 'true',
      difficulty,
      goal,
    };

    const program = await this.programRepository.preload({
      id: programId,
      ...data,
    });

    if (!program) {
      throw new NotFoundException({ status: 'Программа не найдена' });
    }

    if (program.userId !== userId) {
      throw new ForbiddenException({ status: 'Программа не ваша' });
    }

    if (imagePath) {
      if (program.image) {
        const oldPath = join(process.cwd(), program.image);
        await unlink(oldPath).catch(console.error);
      }

      program.image = imagePath;
    }

    await this.programRepository.save(program);

    return { success: true };
  }

  async likeTrainingProgram(id: number, req: CustomRequest) {
    const userId = req.user.userId;
    // const userId = 85;

    const trainingProgram = await this.programRepository.findOne({
      where: { id },
    });

    if (!trainingProgram) {
      throw new NotFoundException({ status: 'Программа не найдена' });
    }

    const likedProgram = this.likedProgramsRepository.create({
      trainingProgram,
      user: { id: userId },
    });

    await this.likedProgramsRepository.save(likedProgram);

    return { success: true };
  }

  async dislikeTrainingProgram(id: number, req: CustomRequest) {
    const userId = req.user.userId;
    // const userId = 85;

    const trainingProgram = await this.programRepository.findOne({
      where: { id },
    });

    if (!trainingProgram) {
      throw new NotFoundException({ status: 'Программа не найдена' });
    }

    const likedProgram = await this.likedProgramsRepository.findOne({
      where: {
        trainingProgram: { id: trainingProgram.id },
        user: { id: userId },
      },
    });

    if (!likedProgram) {
      throw new NotFoundException({
        status: 'Пользователь не подписан на программу',
      });
    }

    await this.likedProgramsRepository.remove(likedProgram);

    return { success: true };
  }
}
