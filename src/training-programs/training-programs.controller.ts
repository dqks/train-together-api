import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(private trainingProgramService: TrainingProgramsService) {}

  @Get()
  getAllPublicTrainingPrograms() {
    return this.trainingProgramService.getAllPublicTrainingPrograms();
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  getMyTrainingPrograms(@Req() req: CustomRequest) {
    return this.trainingProgramService.getMyTrainingPrograms(req);
  }

  @Get('/favourite')
  @UseGuards(JwtAuthGuard)
  getFavouriteTrainingPrograms(@Req() req: CustomRequest) {
    return this.trainingProgramService.getFavouriteTrainingPrograms(req);
  }

  @Post('/subscribe/:id')
  @UseGuards(JwtAuthGuard)
  subscribeTrainingPrograms(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ) {
    return this.trainingProgramService.subscribeTrainingPrograms(+id, req);
  }

  @Delete('/subscribe/:id')
  @UseGuards(JwtAuthGuard)
  unsubscribeTrainingPrograms(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ) {
    return this.trainingProgramService.unsubscribeTrainingPrograms(+id, req);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getTrainingProgram(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.trainingProgramService.getTrainingProgram(Number(id), req);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/programs',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    }),
  )
  @UseGuards(JwtAuthGuard)
  createTrainingProgram(
    @Body() createProgramDto: CreateProgramDto,
    @Req() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/programs/${file.filename}` : null;
    return this.trainingProgramService.createTrainingProgram(
      createProgramDto,
      req,
      imagePath,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteTrainingProgram(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.trainingProgramService.deleteTrainingProgram(+id, req);
  }
}
