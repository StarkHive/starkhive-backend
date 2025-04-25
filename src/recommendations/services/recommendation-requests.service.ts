import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecommendationRequest,
} from '../entities/recommendation-request.entity';
import { CreateRecommendationRequestDto } from '../dto/create-recommendation-request.dto';
import { UpdateRecommendationRequestDto } from '../dto/update-recommendation-request.dto';
import { UserService } from '@src/user/user.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { RequestStatus } from '../enums/RequestStatus.enum';

@Injectable()
export class RecommendationRequestsService {
  constructor(
    @InjectRepository(RecommendationRequest)
    private requestRepository: Repository<RecommendationRequest>,
    private usersService: UserService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    requesterId: string,
    createRequestDto: CreateRecommendationRequestDto,
  ): Promise<RecommendationRequest> {
    const requester = await this.usersService.findOne(requesterId);
    const requestee = await this.usersService.findOne(
      createRequestDto.requesteeId,
    );

    if (!requester || !requestee) {
      throw new NotFoundException('User not found');
    }

    // Check if there's already a pending request
    const existingRequest = await this.requestRepository.findOne({
      where: {
        requester: { id: requesterId },
        requestee: { id: createRequestDto.requesteeId },
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ForbiddenException(
        'A pending request already exists for this user',
      );
    }

    const request = this.requestRepository.create({
      requester,
      requestee,
      message: createRequestDto.message,
      status: RequestStatus.PENDING,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Notify the requestee
    await this.notificationsService.create({
      userId: requestee.id,
      type: 'RECOMMENDATION_REQUEST',
      message: `${requester.username} has requested a recommendation from you.`,
    });

    return savedRequest;
  }

  async findAll(): Promise<RecommendationRequest[]> {
    return this.requestRepository.find();
  }

  async findOne(id: string): Promise<RecommendationRequest> {
    const request = await this.requestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(
        `Recommendation request with ID ${id} not found`,
      );
    }
    return request;
  }

  async findByUser(
    userId: string,
    type: 'sent' | 'received',
  ): Promise<RecommendationRequest[]> {
    if (type === 'sent') {
      return this.requestRepository.find({
        where: { requester: { id: userId } },
        order: { createdAt: 'DESC' },
      });
    } else {
      return this.requestRepository.find({
        where: { requestee: { id: userId } },
        order: { createdAt: 'DESC' },
      });
    }
  }

  async update(
    id: string,
    updateRequestDto: UpdateRecommendationRequestDto,
    userId: string,
  ): Promise<RecommendationRequest> {
    const request = await this.findOne(id);

    // Only the requestee can update the status
    if (request.requestee.id !== userId) {
      throw new ForbiddenException(
        'Only the recipient of the request can update its status',
      );
    }

    Object.assign(request, updateRequestDto);
    const updatedRequest = await this.requestRepository.save(request);

    // Send notification based on status change
    if (updateRequestDto.status === RequestStatus.ACCEPTED) {
      await this.notificationsService.create({
        userId: request.requester.id,
        type: 'REQUEST_ACCEPTED',
        message: `${request.requestee.username} has accepted your recommendation request.`,
      });
    } else if (updateRequestDto.status === RequestStatus.DECLINED) {
      await this.notificationsService.create({
        userId: request.requester.id,
        type: 'REQUEST_DECLINED',
        message: `${request.requestee.username} has declined your recommendation request.`,
      });
    } else if (updateRequestDto.status === RequestStatus.COMPLETED) {
      await this.notificationsService.create({
        userId: request.requester.id,
        type: 'REQUEST_COMPLETED',
        message: `${request.requestee.username} has completed your recommendation request.`,
      });
    }

    return updatedRequest;
  }

  async remove(id: string, userId: string): Promise<void> {
    const request = await this.findOne(id);

    // Only the requester can delete a request
    if (request.requester.id !== userId) {
      throw new ForbiddenException(
        'Only the requester can delete this request',
      );
    }

    await this.requestRepository.remove(request);
  }
}
