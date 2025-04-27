import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class VerifyEmailDto{
  @IsString()
    code: string
}

export class LoginDto{
    @IsString()
    @IsEmail()
    email: string
    
    @IsString()
    password: string

    @IsString()
    @IsOptional()
    mfaToken?: string
}

export class resetPasswordDTO {
    @IsString()
    resetToken: string;
  
    @IsString()
    newPassword: string;
  }
  
  export class forgotPasswordDTO {
    @IsString()
    email: string;
    
  }

  export class Web3LoginDto {
    @IsNotEmpty()
    walletAddress: string;

    @IsNotEmpty()
    signature: string[];

    @IsNotEmpty()
    nonce: string;
}