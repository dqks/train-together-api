import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TrainingProgramDay } from '../training-program-days/training-program-day.entity';

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_user',
    referencedColumnName: 'id',
  })
  user: User;

  @ManyToMany(() => User, (user) => user.followedPrograms)
  followers: User[];

  @OneToMany(() => TrainingProgramDay, (program) => program.trainingProgram)
  days: TrainingProgramDay[];
}
