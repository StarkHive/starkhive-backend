import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async createUser(payload: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(payload);
    return await this.userRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserByWallet(walletAddress: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { walletAddress } });
  }
}
