import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEndorsementDto } from './dto/create-endorsement.dto';
import { EndorsementRepository } from './repository/endorsement.repository';
import { UserProfileRepository } from '@src/user-profile/repository/user-profile.repository';
import { MoreThan } from 'typeorm';
import { NotificationsService } from '@src/notifications/notifications.service';

@Injectable()
export class EndorsementService {
  constructor(
    private readonly endorsementRepo: EndorsementRepository,

    private readonly userProfileRepo: UserProfileRepository,

    // private readonly notificationService: NotificationsService,
  ) {}

  public async endorseSkill(createEndorsementDto: CreateEndorsementDto) {
    const { endorserId, endorsedProfileId, skill } = createEndorsementDto;

    if (endorserId === endorsedProfileId) {
      throw new BadRequestException('You cannot endorse yourself');
    }

    const endorser = await this.userProfileRepo.findOne({
      where: { id: endorserId },
    });
    const endorsedProfile = await this.userProfileRepo.findOne({
      where: { id: endorsedProfileId },
    });

    if (!endorser || !endorsedProfile) {
      throw new NotFoundException('UserProfile not found');
    }

    //  RATE LIMITING: Check if the user has exceeded 5 endorsements in a day
    const dailyEndorsements = await this.endorsementRepo.count({
      where: {
        endorser: { id: endorserId },
        createdAt: MoreThan(new Date(new Date().setHours(0, 0, 0, 0))),
      },
    });

    const MAX_DAILY_ENDORSEMENTS = 5;
    if (dailyEndorsements >= MAX_DAILY_ENDORSEMENTS) {
      throw new BadRequestException(
        'You have reached your daily endorsement limit',
      );
    }

    // 24-hourS check for endorsing the same skill for the same profile
    const lastEndorsement = await this.endorsementRepo.findOne({
      where: {
        endorser: { id: endorserId },
        endorsedProfile: { id: endorsedProfileId },
        skill,
      },
      order: { createdAt: 'DESC' },
    });

    if (lastEndorsement) {
      const timeDifference =
        new Date().getTime() - new Date(lastEndorsement.createdAt).getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        throw new BadRequestException(
          'You can only endorse this skill once every 24 hours',
        );
      }
    }

    // Save the endorsement
    const endorsement = this.endorsementRepo.create({
      endorser,
      endorsedProfile,
      skill,
    });

    await this.endorsementRepo.saveEndorsement(endorsement);

    // //  Send Notification
    // await this.notificationService.create({
    //   userId: endorsedProfileId,
    //   type: 'endorsement',
    //   message: `${endorser.name} endorsed you for ${skill}`,
    // });

    return endorsement;
  }

  public async removeEndorsement(createEndorsementDto: CreateEndorsementDto) {
    const { endorserId, endorsedProfileId, skill } = createEndorsementDto;

    const existingEndorsement = await this.endorsementRepo.findOne({
      where: {
        endorser: { id: endorserId },
        endorsedProfile: { id: endorsedProfileId },
        skill,
      },
    });

    if (!existingEndorsement) {
      throw new NotFoundException('Endorsement not found');
    }

    await this.endorsementRepo.remove(existingEndorsement);
    return { message: 'Endorsement removed' };
  }

  public async getEndorsementsForProfile(
    profileId: number,
    sortedBy: 'skill' | 'count' | 'date',
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.endorsementRepo.findByProfileWithSorting(
      profileId,
      sortedBy,
      order,
    );
  }

  public async getEndorsementCountForProfile(profileId: number) {
    return this.endorsementRepo.countEndorsementsForProfile(profileId);
  }
}
