import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesMusclesController } from './exercises-muscles.controller';

describe('ExercisesMuclesController', () => {
  let controller: ExercisesMusclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesMusclesController],
    }).compile();

    controller = module.get<ExercisesMusclesController>(
      ExercisesMusclesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
