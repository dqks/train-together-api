import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'goals' })
export class Goal {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'smallint' })
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    type: 'character varying',
    length: 50,
  })
  name: string;

  @Column({
    name: 'name_en',
    nullable: false,
    type: 'character varying',
    length: 50,
  })
  nameEng: string;

  @Column({
    name: 'description_en',
    nullable: false,
    type: 'character varying',
    length: 150,
  })
  description: string;

  @Column({
    name: 'description_en',
    nullable: false,
    type: 'character varying',
    length: 150,
  })
  descriptionEng: string;

  @Column({
    name: 'sort_order',
    nullable: false,
    type: 'smallint',
  })
  sortOrder: number;
}
