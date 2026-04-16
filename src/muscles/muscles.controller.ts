import { Controller, Get } from '@nestjs/common';
import { MusclesService } from './muscles.service';

@Controller('muscles')
export class MusclesController {
  constructor(private muscleService: MusclesService) {}

  @Get()
  getAll() {
    return this.muscleService.getAll();
  }
}
