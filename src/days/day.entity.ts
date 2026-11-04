import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'days' })
export class Day {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 15,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'sort_order',
    type: 'smallint',
    nullable: false,
  })
  sortOrder: number;
}
