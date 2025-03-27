import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ProjectVisibility } from "../entities/freelancer-portfolio.entity";

export class CreatePortfolioProjectDto{
    @IsString()
    @IsNotEmpty()
    projectDescription: string;

    @IsUUID()
    categoryId: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsEnum(ProjectVisibility)
    visibility: ProjectVisibility;

    @IsArray()
    @IsOptional()
    mediaUrls: string[]
}