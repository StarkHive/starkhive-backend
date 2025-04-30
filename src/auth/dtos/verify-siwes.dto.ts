import { IsNotEmpty, IsString } from "class-validator";

export class VerifySiweDto {
    @IsNotEmpty()
    @IsString()
     message: string;
    
    @IsNotEmpty()
    @IsString()
    signature: string;
}
  
  