import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  // ManyToOne,
  // JoinColumn,
  Check,
  Unique,
  BeforeInsert,
} from 'typeorm';
import { hash } from 'bcrypt';
// import { Gender } from '../../genders/entities/gender.entity';
// import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'users' })
@Unique('uq_users_email', ['email'])
@Unique('uq_users_nickname', ['nickname'])
@Check('ck_users_weight', `"weight" > 0`)
@Check('ck_users_height', `"height" > 0`)
@Check('date_is_valid', `"date_of_birth" > '1900-01-01'`)
export class User {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({
    name: 'email',
    type: 'text',
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'nickname',
    type: 'character varying',
    length: 100,
    unique: true,
    nullable: false,
  })
  nickname: string;

  @Column({
    name: 'password',
    type: 'text',
    nullable: false,
    select: false, // Не возвращается в SELECT запросах по умолчанию
  })
  password: string;

  @Column({
    name: 'weight',
    type: 'numeric',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  weight: number;

  @Column({
    name: 'height',
    type: 'numeric',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  height: number;

  @Column({
    name: 'avatar',
    type: 'text',
    nullable: true,
  })
  avatar: string | null;

  @Column({
    name: 'id_gender',
    type: 'smallint',
    nullable: true,
  })
  genderId: number;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({
    name: 'id_role',
    type: 'smallint',
    nullable: false,
  })
  roleId: number;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 12);
  }
  // Связь с таблицей genders
  // @ManyToOne(() => Gender, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'id_gender', referencedColumnName: 'id' })
  // gender: Gender;

  // Связь с таблицей roles
  // @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'id_role', referencedColumnName: 'id' })
  // role: Role;
}
