import { EntityRepository, Repository } from "typeorm"
import { RecommendationRequest } from "../entities/recommendation-request.entity"

@EntityRepository(RecommendationRequest)
export class RecommendationRequestRepository extends Repository<RecommendationRequest> {}

