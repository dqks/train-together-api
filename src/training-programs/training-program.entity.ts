import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ManyToOne } from 'typeorm/browser/decorator/relations/ManyToOne.js';
import { User } from '../users/user.entity';

@Entity({ name: 'training_programs' })
export class TrainingProgram {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'id_user', type: 'integer', nullable: false })
  userId: number;

  @Column({
    name: 'name',
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'character varying',
    length: 2500,
    nullable: true,
  })
  description: string;

  @Column({ name: 'image', type: 'text', nullable: true })
  image: string;

  @Column({ name: 'public', type: 'boolean', nullable: false })
  isPublic: boolean;

  @Column({ name: 'created_at', type: 'date', nullable: true })
  createdAt: boolean;

  // @ManyToOne(() => User, (user) => user.photos)
  // user: User;
}
