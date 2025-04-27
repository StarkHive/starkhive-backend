/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { CreateCompanyDto } from './DTO/create-company.dto';
import { CompanyService } from './provider/company.service';
import { UpdateCompanyDto } from './DTO/updateCompanyDto';
import { Web3Auth } from '../auth/decorators/web3-auth.decorator';
import { CacheService } from "@src/cache/cache.service";

interface RequestWithUser extends Request {
  user?: {
    walletAddress?: string;
  };
}

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService, private cacheManager: CacheService) {}

  @Post()
  @Web3Auth()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() _req: RequestWithUser,
  ) {
    // Access authenticated wallet address
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  async findAll() {
    const cachedCompanies = await this.cacheManager.get(`companies:all`, 'CompanyService');
    if (cachedCompanies) {
      return cachedCompanies;
    }
    const companies = await this.companyService.findAll();
    await this.cacheManager.set(`companies:all`, companies);
    return companies;
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const cachedCompany = await this.cacheManager.get(`companies:${id}`, 'CompanyService');
    if (cachedCompany) {
      return cachedCompany;
    }
    const company = await this.companyService.findOne(id);
    await this.cacheManager.set(`companies:${id}`, company);
    return company;
  }

  @Patch(':id')
  @Web3Auth()
  async update(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Req() _req: RequestWithUser,
  ) {
    // const _walletAddress = req.user?.walletAddress;
    await this.cacheManager.del(`companies:${id}`);
    return await this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Web3Auth()
  async remove(@Param('id') id: number, @Req() _req: RequestWithUser) {
    // const walletAddress = req.user?.walletAddress;
    await this.cacheManager.del(`companies:${id}`);
    return await this.companyService.remove(id);
  }
}
