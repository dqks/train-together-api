import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingProgram } from '../training-programs/training-program.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'liked_training_programs' })
export class LikedTrainingPrograms {
  @PrimaryGeneratedColumn('increment', { name: 'id', type: 'bigint' })
  id: number;

  @ManyToOne(() => User, (user) => user.likedProgramsRelations)
  @JoinColumn({ name: 'id_user' })
  user: TrainingProgram;

  @ManyToOne(() => TrainingProgram, (program) => program.followersRelations)
  @JoinColumn({ name: 'id_training_program' })
  trainingProgram: TrainingProgram;

  @Column({
    name: 'created_at',
    nullable: false,
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
