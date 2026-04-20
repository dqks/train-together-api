import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';

@Entity({ name: 'equipment' })
export class Equipment {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    type: 'character varying',
    length: 100,
  })
  name: string;

  @Column({
    name: 'image',
    nullable: false,
    type: 'text',
  })
  image: string;

  @Column({
    name: 'name_en',
    nullable: false,
    type: 'character varying',
    length: 70,
  })
  nameEng: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.muscles)
  exercises: Exercise[];
}
