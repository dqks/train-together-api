import { Module } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';

@Module({
  providers: [MusclesService],
  controllers: [MusclesController]
})
export class MusclesModule {}
