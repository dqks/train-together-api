import { Test, TestingModule } from '@nestjs/testing';
import { TrainingProgramsService } from './training-programs.service';

describe('ProgramsService', () => {
  let service: TrainingProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingProgramsService],
    }).compile();

    service = module.get<TrainingProgramsService>(TrainingProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
