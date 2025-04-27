/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MailProvider } from '@src/mail/providers/mail-provider.service';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    /**
     * Inject mailService
     */
    private readonly mailProvider: MailProvider,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    // Save user first before sending email
    await this.userRepository.save(user);

    try {
      await this.mailProvider.WelcomeEmail({
        email: user.email,
        username: user.username ?? ''
      });
    } catch (error) {
      throw new RequestTimeoutException(error);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getUserConnections(userId: string) {
    // Implementation for getting user connections
    return [];
  }
}