import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards, UseInterceptors, HttpStatus, HttpCode, UploadedFile } from '@nestjs/common';
import { Request } from 'express'; // Import the extended Request type
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '@src/audit/audit.service';
import { User } from './user.interface'; // Import the User interface
import { CacheService } from "@src/cache/cache.service";
import { UserImportService } from './providers/user-import.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ImportResultDto } from './dto/bulk-import.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auditService: AuditService,
    private cacheManager: CacheService,
    private readonly userImportService: UserImportService
  ) {}
  

  @Post()
  // @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const user = await this.userService.create(createUserDto);

    const currentUser = req.user as User; // Cast req.user to User

    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    await this.auditService.createAuditLog({
      action: 'user_created',
      resourceType: 'user',
      userId: currentUser.id,
      ipAddress: req.ip,
    });

    return user;
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 10 // Only one file allowed
    },
    fileFilter: (req, file, cb) => {
      // Allow only CSV and JSON files
      if (file.mimetype === 'text/csv' || file.mimetype === 'application/json') {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and JSON files are allowed'), false);
      }
    }
  }))
  @ApiOperation({ 
    summary: 'Import users in bulk via CSV or JSON file',
    description: 'Allows administrators to import multiple user records at once'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async importUsers(
    @UploadedFile() file: Express.Multer.File
  ): Promise<ImportResultDto> {
    return this.userImportService.importUsers(file);
  }


  @Get()
  async findAll() {
    const cachedUsers = await this.cacheManager.get(`user:all`, 'UserService');
    if (cachedUsers) {
      return cachedUsers;
    }
    const users = await this.userService.findAll();
    await this.cacheManager.set(`user:all`, users);
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cachedUser = await this.cacheManager.get(`user:${id}`, 'UserService');
    if (cachedUser) {
      return cachedUser;
    }
    const user =  await this.userService.findOne(id);
    await this.cacheManager.set(`user:${id}`, user);
    return user;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.cacheManager.del(`user:${id}`);
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheManager.del(`user:${id}`);
    return this.userService.remove(id);
  }
}