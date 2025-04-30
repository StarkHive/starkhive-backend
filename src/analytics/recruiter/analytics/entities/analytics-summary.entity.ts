import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsSummary {
  @ApiProperty({ description: 'Total number of candidate views' })
  totalViews: number;

  @ApiProperty({ description: 'Total number of applications submitted' })
  totalApplications: number;

  @ApiProperty({ description: 'Total number of application responses' })
  totalResponses: number;

  @ApiProperty({ description: 'Overall average time to hire (in days)' })
  averageTimeToHire: number;
}
