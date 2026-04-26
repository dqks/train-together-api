import {
  BadRequestException,
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
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { JwtPayload } from '../auth/jwt.strategy';
import { TrainingProgramDay } from '../training-program-days/training-program-day.entity';

@Injectable()
export class TrainingProgramsService {
  constructor(
    @InjectRepository(TrainingProgram)
    private programRepository: Repository<TrainingProgram>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UsersService,
    private configService: ConfigService,
  ) {}

  async getAllPublicTrainingPrograms() {
    const trainingPrograms = await this.programRepository.find({
      where: { isPublic: true },
      relations: ['user'],
      order: { createdAt: 'desc' },
    });

    return trainingPrograms.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
      imageUrl: p.image,
      user: {
        id: p.user.id,
        nickname: p.user.nickname,
      },
    }));
  }

  async getTrainingProgram(id: number, req: Request) {
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

    if (!p) {
      return null;
    }

    let isFollowed = false;

    if (req.cookies.access_token) {
      // @ts-ignore
      const decoded: JwtPayload | undefined = jwt.verify(
        req.cookies.access_token,
        this.configService.get('JWT_SECRET') as string,
      );

      if (decoded) {
        const user = await this.userService.getUserByEmailWithFollowed(
          decoded?.email,
        );

        if (user?.followedPrograms.find((program) => program.id === p.id)) {
          isFollowed = true;
        }
      }
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

    console.log(user?.followedProgramsRelations);

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
    return this.programRepository.find({
      where: { userId },
      order: { createdAt: 'desc' },
    });
  }

  async createTrainingProgram(
    createProgramDto: CreateProgramDto,
    req: CustomRequest,
  ) {
    const userId = req.user.userId;

    const newProgram = this.programRepository.create({
      userId: userId,
      name: createProgramDto.name,
      description: createProgramDto.description,
      isPublic: !!createProgramDto.isPublic,
      // image: createProgramDto.image,
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
      await this.programRepository.delete(id);
      return { success: true };
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
