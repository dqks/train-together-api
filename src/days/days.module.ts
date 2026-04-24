import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day } from './day.entity';
import { DaysService } from './days.service';

@Module({
  imports: [TypeOrmModule.forFeature([Day])],
  // controllers: [],
  providers: [DaysService],
})
export class DaysModule {}
