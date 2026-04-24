import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MusclesModule } from './muscles/muscles.module';
import { TrainingProgramsModule } from './training-programs/training-programs.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ExerciseTypesModule } from './exercise-types/exercise-types.module';
import { ExerciseProgressionTypesModule } from './exercise-progression-types/exercise-progression-types.module';
import { TrainingProgramDaysModule } from './training-program-days/training-program-days.module';
import { DaysModule } from './days/days.module';
import { TrainingProgramExercisesModule } from './training-program-exercises/training-program-exercises.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ExercisesModule,
    MusclesModule,
    EquipmentModule,
    TrainingProgramsModule,
    RolesModule,
    ExerciseTypesModule,
    ExerciseProgressionTypesModule,
    DaysModule,
    TrainingProgramExercisesModule,
    TrainingProgramDaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
