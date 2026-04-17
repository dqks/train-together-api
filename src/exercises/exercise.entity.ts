import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExerciseMuscle } from '../exercises-muscles/exercises-muscle.entity';

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
    name: 'advice',
    nullable: false,
    type: 'text',
  })
  advice: string;

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

  @OneToMany(() => ExerciseMuscle, (exerciseMuscle) => exerciseMuscle.exercise)
  exerciseMuscles: ExerciseMuscle[];
}
