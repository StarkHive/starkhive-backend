import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TimeToHireDto {
  @ApiProperty({ description: 'Average time to hire in days' })
  averageTimeToHire: number;

  @ApiProperty({ description: 'Time series data for time-to-hire' })
  timeSeriesData: Array<{
    period: string;
    averageDays: number;
  }>;
}

class ResponseRateDto {
  @ApiProperty({ description: 'Overall response rate percentage' })
  overallResponseRate: number;

  @ApiProperty({ description: 'Response rates by application stage' })
  responseRatesByStage: Array<{
    stage: string;
    count: number;
    rate: number;
  }>;
}

class CandidateViewDto {
  @ApiProperty({ description: 'Job title' })
  jobTitle: string;

  @ApiProperty({ description: 'Number of views' })
  viewCount: number;
}

class HiringFunnelDto {
  @ApiProperty({ description: 'Stage in the hiring process' })
  stage: string;

  @ApiProperty({ description: 'Number of candidates at this stage' })
  count: number;

  @ApiProperty({ description: 'Conversion rate from previous stage (null for first stage)' })
  conversionRate: number | null;
}

export class MetricsResponseDto {
  @ApiProperty({ description: 'Time to hire metrics', type: TimeToHireDto })
  @Type(() => TimeToHireDto)
  timeToHire: TimeToHireDto;

  @ApiProperty({ description: 'Response rate metrics', type: ResponseRateDto })
  @Type(() => ResponseRateDto)
  responseRates: ResponseRateDto;

  @ApiProperty({ description: 'Candidate views by job', type: [CandidateViewDto] })
  @Type(() => CandidateViewDto)
  candidateViews: CandidateViewDto[];

  @ApiProperty({ description: 'Hiring funnel metrics', type: [HiringFunnelDto] })
  @Type(() => HiringFunnelDto)
  hiringFunnel: HiringFunnelDto[];
}