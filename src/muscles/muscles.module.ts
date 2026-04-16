import { Module } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Muscle } from './muscle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Muscle])],
  providers: [MusclesService],
  controllers: [MusclesController],
})
export class MusclesModule {}
