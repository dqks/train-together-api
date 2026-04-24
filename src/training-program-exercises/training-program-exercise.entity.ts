import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';
import { TrainingProgramDay } from '../training-program-days/training-program-day.entity';

@Entity({ name: 'training_programs_exercises' })
export class TrainingProgramExercise {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @Column({
    name: 'sets',
    type: 'smallint',
    nullable: false,
  })
  sets: number;

  @Column({
    name: 'reps',
    type: 'smallint',
    nullable: false,
  })
  reps: number;

  @Column({
    name: 'exercise_order',
    type: 'smallint',
    nullable: false,
  })
  exerciseOrder: number;

  @Column({
    name: 'id_exercise',
    type: 'integer',
    nullable: false,
  })
  exerciseId: number;

  @Column({
    name: 'id_training_program_day',
    type: 'integer',
    nullable: false,
  })
  trainingProgramDayId: number;

  @ManyToOne(() => TrainingProgramDay, (programDay) => programDay.exercises)
  @JoinColumn({ name: 'id_training_program_day', referencedColumnName: 'id' })
  day: TrainingProgramDay;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_exercise', referencedColumnName: 'id' })
  exercise: Exercise;
}
