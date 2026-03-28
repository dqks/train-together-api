import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'default_exercises' })
export class Exercise {
  @PrimaryGeneratedColumn()
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
}
