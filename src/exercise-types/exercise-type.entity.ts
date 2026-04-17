import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'exercise_types' })
export class ExerciseType {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 70,
    nullable: false,
  })
  name: string;
}
