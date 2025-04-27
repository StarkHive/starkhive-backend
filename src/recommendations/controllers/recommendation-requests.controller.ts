import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { RecommendationRequestsService } from '../services/recommendation-requests.service';
import { CreateRecommendationRequestDto } from '../dto/create-recommendation-request.dto';
import { UpdateRecommendationRequestDto } from '../dto/update-recommendation-request.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('recommendation-requests')
@ApiBearerAuth()
@Controller('recommendation-requests')
export class RecommendationRequestsController {
  constructor(
    private readonly requestsService: RecommendationRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recommendation request' })
  @ApiResponse({
    status: 201,
    description: 'The recommendation request has been successfully created.',
  })
  create(
    @Request() req: any,
    @Body() createRequestDto: CreateRecommendationRequestDto,
  ) {
    return this.requestsService.create(req.user.id, createRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recommendation requests' })
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recommendation request by id' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Get('user/:type')
  @ApiOperation({ summary: 'Get recommendation requests for the current user' })
  findByUser(@Request() req: any, @Param('type') type: 'sent' | 'received') {
    return this.requestsService.findByUser(req.user.id, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recommendation request' })
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRecommendationRequestDto,
    @Request() req: any,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recommendation request' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.requestsService.remove(id, req.user.id);
  }
}
