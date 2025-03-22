import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  walletAddress?: string;

}

