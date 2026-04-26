import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExerciseProgressionType } from '../exercise-progression-types/exercise-progression-type.entity';
import { ExerciseType } from '../exercise-types/exercise-type.entity';
import { Muscle } from '../muscles/muscle.entity';
import { Equipment } from '../equipment/equipment.entity';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';

@Entity({ name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'description',
    nullable: false,
    type: 'text',
  })
  description: string;

  @Column({
    name: 'technique_json',
    nullable: true,
    type: 'jsonb',
  })
  techniqueJson: object;

  @Column({
    name: 'advice',
    nullable: false,
    type: 'text',
  })
  advice: string;

  @Column({
    name: 'advice_json',
    nullable: true,
    type: 'json',
  })
  adviceJson: object;

  @Column({
    name: 'technique',
    nullable: false,
    type: 'text',
  })
  technique: string;

  @Column({
    name: 'id_exercise_type',
    nullable: false,
    type: 'smallint',
  })
  exerciseTypeId: number;

  @Column({
    name: 'image',
    nullable: true,
    type: 'text',
  })
  image: string;

  @Column({
    name: 'id_exercise_progression_type',
    nullable: false,
    type: 'smallint',
  })
  exerciseProgressionTypeId: number;

  @Column({
    name: 'id_user',
    nullable: true,
    type: 'integer',
  })
  userId: number;

  @ManyToMany(() => Muscle, (muscle) => muscle.exercises)
  @JoinTable({
    name: 'exercises_muscles',
    joinColumn: { name: 'id_exercise', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_muscle', referencedColumnName: 'id' },
  })
  muscles: Muscle[];

  @ManyToMany(() => Equipment, (equipment) => equipment.exercises)
  @JoinTable({
    name: 'exercises_equipment',
    joinColumn: { name: 'id_exercise', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_equipment', referencedColumnName: 'id' },
  })
  equipment: Equipment[];

  @ManyToOne(() => ExerciseType, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_exercise_type',
    referencedColumnName: 'id',
  })
  exerciseType: ExerciseType;

  @ManyToOne(() => ExerciseProgressionType, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_exercise_progression_type',
    referencedColumnName: 'id',
  })
  exerciseProgressionType: ExerciseProgressionType;

  @OneToMany(() => ExerciseMuscle, (em) => em.exercise)
  exerciseMuscles: ExerciseMuscle[];
}
