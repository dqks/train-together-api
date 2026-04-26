import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TrainingProgram } from '../training-programs/training-program.entity';

@Entity('followed_training_programs')
export class FollowedTrainingProgram {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ name: 'id_user', type: 'integer', nullable: false })
  userId: number;

  @Column({ name: 'id_training_program', type: 'integer', nullable: false })
  trainingProgramId: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  createdAt: Date;

  // Связи
  @ManyToOne(() => User, (user) => user.followedProgramsRelations)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => TrainingProgram, (program) => program.followersRelations)
  @JoinColumn({ name: 'id_training_program' })
  trainingProgram: TrainingProgram;
}
