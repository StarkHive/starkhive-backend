import { EntityRepository, Repository } from "typeorm"
import { Recommendation } from "../entities/recommendation.entity"

@EntityRepository(Recommendation)
export class RecommendationRepository extends Repository<Recommendation> {}

