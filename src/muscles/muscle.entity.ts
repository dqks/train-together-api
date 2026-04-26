import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';

@Entity({ name: 'muscles' })
export class Muscle {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    type: 'character varying',
    length: 70,
  })
  name: string;

  @Column({
    name: 'name_en',
    nullable: false,
    type: 'character varying',
    length: 70,
  })
  nameEng: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.muscles)
  exercises: Exercise[];

  @OneToMany(() => ExerciseMuscle, (em) => em.muscle)
  exerciseMuscles: ExerciseMuscle[];
}
