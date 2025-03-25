import { createParamDecorator, ExecutionContext } from '@nestjs/common';  
import { User } from 'src/user/entities/user.entity';

export const CurrentUser = createParamDecorator(  
  (data: unknown, ctx: ExecutionContext): User => {  
    const request = ctx.switchToHttp().getRequest();  
    return request.user; // Assuming the user is set in the request by a guard (like JwtAuthGuard)  
  },  
);  