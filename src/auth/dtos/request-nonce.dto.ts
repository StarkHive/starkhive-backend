import { IsEthereumAddress } from 'class-validator';

export class RequestNonceDto {
  @IsEthereumAddress()
  address: string;
}
