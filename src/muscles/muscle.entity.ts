import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExerciseMuscle } from '../exercises-muscles/exercises-muscle.entity';

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
  name: number;

  @Column({
    name: 'name_en',
    nullable: false,
    type: 'character varying',
    length: 70,
  })
  nameEng: number;

  @OneToMany(() => ExerciseMuscle, (exerciseMuscle) => exerciseMuscle.muscle)
  exerciseMuscle: ExerciseMuscle[];
}
