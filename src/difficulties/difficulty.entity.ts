import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'difficulties' })
export class Difficulty {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    type: 'character varying',
    length: 30,
  })
  name: string;

  @Column({
    name: 'name_en',
    nullable: false,
    type: 'character varying',
    length: 30,
  })
  nameEng: string;

  @Column({
    name: 'description_en',
    nullable: false,
    type: 'character varying',
    length: 100,
  })
  description: string;

  @Column({
    name: 'description_en',
    nullable: false,
    type: 'character varying',
    length: 100,
  })
  descriptionEng: string;

  @Column({
    name: 'level',
    nullable: false,
    type: 'smallint',
  })
  level: number;
}
