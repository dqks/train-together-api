import { Test, TestingModule } from '@nestjs/testing';
import { TrainingProgramsController } from './training-programs.controller';

describe('ProgramsController', () => {
  let controller: TrainingProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingProgramsController],
    }).compile();

    controller = module.get<TrainingProgramsController>(
      TrainingProgramsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
