import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { createImageInterceptor } from '../common/interceptors/image.interceptor';
import { AddTrainingProgramDetailsDto } from './dto/add-details.dto';
import { FilterProgramDto } from './dto/filter-program.dto';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(private trainingProgramService: TrainingProgramsService) {}

  @Get()
  getAllPublicTrainingPrograms(@Query() filter: FilterProgramDto) {
    return this.trainingProgramService.getAllPublicTrainingPrograms(filter);
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  getMyTrainingPrograms(@Req() req: CustomRequest) {
    return this.trainingProgramService.getMyTrainingPrograms(req);
  }

  @Get('create-info')
  @UseGuards(JwtAuthGuard)
  getCreateInfo() {
    return this.trainingProgramService.getCreateInfo();
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

  // Добавление дней + упражнений в программу тренировок
  // Изменение названия, описания, изображения будет сделано через другой endpoint
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  addTrainingProgramDetails(
    @Param('id') id: string,
    @Req() req: CustomRequest,
    @Body() addDetails: AddTrainingProgramDetailsDto,
  ) {
    return this.trainingProgramService.addTrainingProgramDetails(
      Number(id),
      req,
      addDetails,
    );
  }

  @Post()
  @UseInterceptors(createImageInterceptor('programs'))
  // @UseGuards(JwtAuthGuard)
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
