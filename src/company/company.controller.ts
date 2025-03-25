import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@nestjs/common';
import { CreateCompanyDto } from './DTO/create-company.dto';
import { CompanyService } from './provider/company.service';
import { UpdateCompanyDto } from './DTO/updateCompanyDto';
import { Web3Auth } from '../auth/decorators/web3-auth.decorator';

interface RequestWithUser extends Request {
    user?: {
        walletAddress?: string;
    };
}

@Controller('companies')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Post()
    @Web3Auth()
    async create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: RequestWithUser) {
        // Access authenticated wallet address
        const walletAddress = req.user?.walletAddress;
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    async findAll() {
        return this.companyService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return await this.companyService.findOne(id);
    }

    @Patch(':id')
    @Web3Auth()
    async update(
        @Param('id') id: number,
        @Body() updateCompanyDto: UpdateCompanyDto,
        @Req() req: RequestWithUser
    ) {
        const walletAddress = req.user?.walletAddress;
        return await this.companyService.update(id, updateCompanyDto);
    }

    @Delete(':id')
    @Web3Auth()
    async remove(@Param('id') id: number, @Req() req: RequestWithUser) {
        const walletAddress = req.user?.walletAddress;
        return await this.companyService.remove(id);
    }
}