import { Controller, Get } from '@nestjs/common';
import { DaysService } from './days.service';

@Controller('days')
export class DaysController {
  constructor(private daysService: DaysService) {}

  @Get()
  getAll() {
    return this.daysService.getAll();
  }
}
