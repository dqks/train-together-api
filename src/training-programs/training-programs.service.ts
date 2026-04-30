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
    @InjectRepository(TrainingProgramExercise)
    private programExercisesRepository: Repository<TrainingProgramExercise>,
    private exerciseService: ExercisesService,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(Difficulty)
    private difficultyRepository: Repository<Difficulty>,
  ) {}

  async getAllPublicTrainingPrograms(dto: FilterProgramDto) {
    const query = this.programRepository
      .createQueryBuilder('program')
      .select([
        'program.id as id',
        'program.name as name',
        'program.description as description',
        // 'program.created_at as createdAt',
        'program.image as imageUrl',
        'g.name as goalName',
        'd.name as diffName',
        'u.nickname as userNickname',
        'u.id as userId',
      ])
      .where('program.isPublic = :isPublic', { isPublic: true })
      .leftJoinAndSelect('program.user', 'u')
      .leftJoinAndSelect('program.goal', 'g')
      .leftJoinAndSelect('program.difficulty', 'd');

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

    if (sortBy === SortOptions.POPULAR) {
      query.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from('followed_training_programs', 'follow')
          .where('follow.id_training_program = program.id');
      }, 'followerscount');
      query.orderBy('followerscount', 'DESC');
    } else {
      query.orderBy('program.created_at', 'DESC');
    }

    const trainingPrograms = await query.getRawMany();

    console.log(trainingPrograms);

    return trainingPrograms.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      // createdAt: p.createdat,
      imageUrl: p.imageurl,
      goal: p.goalname,
      difficulty: p.diffname,
      user: {
        // id: p.userid,
        nickname: p.usernickname,
      },
      followersCount: p.followerscount,
    }));
  }

  async getTrainingProgram(id: number, req: CustomRequest) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const p = await this.programRepository.findOne({
      where: { id },
      relations: [
        'user',
        'days',
        'days.day',
        'days.exercises',
        'days.exercises.exercise',
      ],
    });

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

    return {
      id: p.id,
      name: p.name,
      isFollowed,
      description: p.description,
      createdAt: p.createdAt,
      imageUrl: p.image,
      user: {
        id: p.user.id,
        nickname: p.user.nickname,
      },
      days: p.days.map((day: TrainingProgramDay) => ({
        id: day.id,
        name: day.name,
        description: day.description,
        day: day.day,
        exercises: day.exercises.map((exercise) => ({
          id: exercise.id,
          sets: exercise.sets,
          reps: exercise.reps,
          exerciseOrder: exercise.exerciseOrder,
          exercise: {
            id: exercise.exercise.id,
            name: exercise.exercise.name,
            image: exercise.exercise.image,
          },
        })),
      })),
    };
  }

  async getFavouriteTrainingPrograms(req: CustomRequest) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
      relations: [
        'followedProgramsRelations',
        'followedProgramsRelations.user',
        'followedProgramsRelations.trainingProgram',
        'followedProgramsRelations.trainingProgram.user',
      ],
    });

    return user?.followedProgramsRelations
      .map((ftp) => ({
        id: ftp.trainingProgram.id,
        name: ftp.trainingProgram.name,
        description: ftp.trainingProgram.description,
        createdAt: ftp.createdAt,
        imageUrl: ftp.trainingProgram.image,
        user: {
          id: ftp.trainingProgram.user.id,
          nickname: ftp.trainingProgram.user.nickname,
        },
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
    const userId: number = req.user.userId;

    const program = await this.programRepository.find({
      select: ['id', 'name', 'description', 'userId', 'createdAt', 'image'],
      where: { userId },
      order: { createdAt: 'desc' },
    });

    return program.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      userId: p.userId,
      createdAt: p.createdAt,
      imageUrl: p.image,
    }));
  }

  async createTrainingProgram(
    dto: CreateProgramDto,
    req: CustomRequest,
    image: string | null,
  ) {
    // const userId = req.user.userId;
    const userId = 85;

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
      console.log(program.days);
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
}
