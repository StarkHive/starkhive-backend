import { PartialType } from "@nestjs/mapped-types";
import { CreatePortfolioProjectDto } from "./create-portfolio-project.dto";

export class UpdatePortfolioProjectDto extends PartialType(CreatePortfolioProjectDto) {}