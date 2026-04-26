import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';
import { Muscle } from '../muscles/muscle.entity';

// exercise-muscle.entity.ts
@Entity('exercises_muscles')
export class ExerciseMuscle {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'integer' })
  id: number;

  @Column({
    name: 'id_exercise',
    nullable: false,
    type: 'integer',
  })
  exerciseId: number;

  @Column({
    name: 'id_muscle',
    nullable: false,
    type: 'smallint',
  })
  muscleId: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Exercise, (exercise) => exercise.exerciseMuscles)
  @JoinColumn({ name: 'id_exercise' })
  exercise: Exercise;

  @ManyToOne(() => Muscle, (muscle) => muscle.exerciseMuscles)
  @JoinColumn({ name: 'id_muscle' })
  muscle: Muscle;
}
