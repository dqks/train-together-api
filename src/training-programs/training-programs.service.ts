import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { CustomRequest } from '../common/types/custom-request';

@Injectable()
export class TrainingProgramsService {
  constructor(
    @InjectRepository(TrainingProgram)
    private programRepository: Repository<TrainingProgram>,
  ) {}

  async getAllPublicTrainingPrograms() {
    return this.programRepository.find({
      where: { isPublic: true },
    });
  }

  async getMyTrainingPrograms(req: CustomRequest) {
    const userId: number = req.user.userId;
    return this.programRepository.find({
      where: { userId },
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
