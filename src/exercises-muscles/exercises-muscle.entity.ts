import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';
import { Muscle } from '../muscles/muscle.entity';

@Entity({ name: 'exercises_muscles' })
export class ExerciseMuscle {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.exerciseMuscles)
  @JoinColumn({ name: 'id_exercise' })
  exercise: Exercise;

  @ManyToOne(() => Muscle, (muscle) => muscle.exerciseMuscle)
  @JoinColumn({ name: 'id_muscle' })
  muscle: Muscle;
}
