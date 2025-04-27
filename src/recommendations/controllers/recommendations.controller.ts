import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RecommendationsService } from '../services/recommendations.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import { UpdateRecommendationDto } from '../dto/update-recommendation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recommendation' })
  @ApiResponse({
    status: 201,
    description: 'The recommendation has been successfully created.',
  })
  create(
    @Request() req: any,
    @Body() createRecommendationDto: CreateRecommendationDto,
  ) {
    return this.recommendationsService.create(
      req.user.id,
      createRecommendationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all recommendations' })
  findAll() {
    return this.recommendationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recommendation by id' })
  findOne(@Param('id') id: string) {
    return this.recommendationsService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get recommendations for a specific user' })
  findByRecipient(
    @Param('userId') userId: string,
    @Query('onlyPublic') onlyPublic: boolean = false,
  ) {
    return this.recommendationsService.findByRecipient(userId, onlyPublic);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recommendation' })
  update(
    @Param('id') id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto,
    @Request() req: any,
  ) {
    return this.recommendationsService.update(
      id,
      updateRecommendationDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recommendation' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.recommendationsService.remove(id, req.user.id);
  }
}
