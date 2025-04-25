import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { RecommendationStatus } from '../enums/RecommendationStatus.enum';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import { UpdateRecommendationDto } from '../dto/update-recommendation.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { UserService } from '@src/user/user.service';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    private usersService: UserService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    authorId: string,
    createRecommendationDto: CreateRecommendationDto,
  ): Promise<Recommendation> {
    const author = await this.usersService.findOne(authorId);
    const recipient = await this.usersService.findOne(
      createRecommendationDto.recipientId,
    );

    if (!author || !recipient) {
      throw new NotFoundException('User not found');
    }

    const recommendation = this.recommendationRepository.create({
      author,
      recipient,
      content: createRecommendationDto.content,
      status: RecommendationStatus.PENDING,
      isPublic: createRecommendationDto.isPublic || false,
    });

    const savedRecommendation =
      await this.recommendationRepository.save(recommendation);

    await this.notificationsService.create({
      userId: recipient.id,
      type: 'NEW_RECOMMENDATION',
      message: `${author.username} has written you a recommendation.`,
    });

    return savedRecommendation;
  }

  async findAll(): Promise<Recommendation[]> {
    return this.recommendationRepository.find();
  }

  async findOne(id: string): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
    });
    if (!recommendation) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }
    return recommendation;
  }

  async findByRecipient(
    recipientId: string,
    onlyPublic = false,
  ): Promise<Recommendation[]> {
    const query = this.recommendationRepository
      .createQueryBuilder('recommendation')
      .leftJoinAndSelect('recommendation.author', 'author')
      .leftJoinAndSelect('recommendation.recipient', 'recipient')
      .where('recipient.id = :recipientId', { recipientId })
      .andWhere('recommendation.status = :status', {
        status: RecommendationStatus.APPROVED,
      });

    if (onlyPublic) {
      query.andWhere('recommendation.isPublic = :isPublic', { isPublic: true });
    }

    return query.getMany();
  }

  async update(
    id: string,
    updateRecommendationDto: UpdateRecommendationDto,
    userId: string,
  ): Promise<Recommendation> {
    const recommendation = await this.findOne(id);

    const isAuthor = recommendation.author.id === userId;
    const isRecipient = recommendation.recipient.id === userId;

    if (!isAuthor && !isRecipient) {
      throw new ForbiddenException(
        'You are not authorized to update this recommendation',
      );
    }

    if (isAuthor && !isRecipient) {
      if (
        updateRecommendationDto.status ||
        updateRecommendationDto.isPublic !== undefined
      ) {
        throw new ForbiddenException('Authors can only update the content');
      }
    }

    if (isRecipient && !isAuthor) {
      if (updateRecommendationDto.content) {
        throw new ForbiddenException('Recipients cannot update the content');
      }
    }

    Object.assign(recommendation, updateRecommendationDto);
    const updatedRecommendation =
      await this.recommendationRepository.save(recommendation);

    if (updateRecommendationDto.status === RecommendationStatus.APPROVED) {
      await this.notificationsService.create({
        userId: recommendation.author.id,
        type: 'RECOMMENDATION_APPROVED',
        message: `Your recommendation for ${recommendation.recipient.username} has been approved.`,
      });
    } else if (
      updateRecommendationDto.status === RecommendationStatus.REJECTED
    ) {
      await this.notificationsService.create({
        userId: recommendation.author.id,
        type: 'RECOMMENDATION_REJECTED',
        message: `Your recommendation for ${recommendation.recipient.username} has been rejected.`,
      });
    }

    return updatedRecommendation;
  }

  async remove(id: string, userId: string): Promise<void> {
    const recommendation = await this.findOne(id);

    if (
      recommendation.author.id !== userId &&
      recommendation.recipient.id !== userId
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this recommendation',
      );
    }

    await this.recommendationRepository.remove(recommendation);
  }
}
