import { Test, TestingModule } from '@nestjs/testing';
import { CompanyPostingsService } from './company-postings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyPosting } from './entities/company-posting.entity';
import { Repository } from 'typeorm';

describe('CompanyPostingsService', () => {
  let service: CompanyPostingsService;
  let repository: Repository<CompanyPosting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyPostingsService,
        {
          provide: getRepositoryToken(CompanyPosting),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CompanyPostingsService>(CompanyPostingsService);
    repository = module.get<Repository<CompanyPosting>>(
      getRepositoryToken(CompanyPosting),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a company posting', async () => {
    const companyData = {
      name: 'Tech Co',
      description: 'Tech company specializing in AI',
      industry: 'Software',
      location: 'New York',
      companySize: 500,
      benefits: ['Health Insurance', 'Remote Work'],
      website: 'https://techco.com',
      contracts: [],
      search_vector: '',
      createdAt: new Date(),
    };

    jest.spyOn(repository, 'create').mockReturnValue(companyData as any);
    jest.spyOn(repository, 'save').mockResolvedValue({
      id: 1,
      ...companyData,
    });

    const company = await service.create(companyData);
    expect(company).toHaveProperty('id', 1);
  });
});
