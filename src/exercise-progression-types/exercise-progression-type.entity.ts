import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'exercise_progression_types' })
export class ExerciseProgressionType {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 10,
    nullable: false,
  })
  name: string;
}
