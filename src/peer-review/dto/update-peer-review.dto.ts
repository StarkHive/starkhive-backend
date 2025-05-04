import { PartialType } from '@nestjs/mapped-types';
import { CreatePeerReviewDto } from './create-peer-review.dto';

export class UpdatePeerReviewDto extends PartialType(CreatePeerReviewDto) {}
