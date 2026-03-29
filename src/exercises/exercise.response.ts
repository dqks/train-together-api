import { Muscle } from '../muscles/muscle.entity';

export type ExerciseResponse = Array<{
  id: number;
  name: string;
  image: string;
  exerciseMuscles: Muscle[];
}>;
