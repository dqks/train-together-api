import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingProgram } from '../training-programs/training-program.entity';
import { Day } from '../days/day.entity';
import { TrainingProgramExercise } from '../training-program-exercises/training-program-exercise.entity';

@Entity({ name: 'training_programs_days' })
export class TrainingProgramDay {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @Column({
    name: 'id_day',
    type: 'smallint',
    nullable: false,
  })
  dayId: number;

  @Column({
    name: 'id_training_program',
    type: 'integer',
    nullable: false,
  })
  trainingProgramId: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 50,
    nullable: true,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'character varying',
    length: 2500,
    nullable: true,
  })
  description: string;

  @ManyToOne(() => TrainingProgram, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_training_program', referencedColumnName: 'id' })
  trainingProgram: TrainingProgram;

  @ManyToOne(() => Day, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_day', referencedColumnName: 'id' })
  day: Day;

  @OneToMany(
    () => TrainingProgramExercise,
    (programExercise) => programExercise.day,
  )
  exercises: TrainingProgramExercise[];
}
