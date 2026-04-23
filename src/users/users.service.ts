import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegistrationDto } from '../auth/dto/registration.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private roleService: RolesService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'nickname', 'password', 'roleId'],
    });
  }

  async getUserByEmailWithFollowed(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'nickname', 'password', 'roleId'],
      relations: ['followedPrograms'],
    });
  }

  async getUserByNickname(nickname: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { nickname },
      select: ['id', 'email', 'nickname', 'password', 'roleId'],
    });
  }

  async createUser(registrationDto: RegistrationDto) {
    const user = this.usersRepository.create(registrationDto);
    const role = await this.roleService.getRoleByValue('Пользователь');
    user.roleId = role?.id || 2;
    await this.usersRepository.save(user);
    return user;
  }
}
