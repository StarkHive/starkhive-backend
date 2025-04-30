import { ApiProperty } from '@nestjs/swagger';

export class DailyAnalytics {
  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Number of candidate views on this date' })
  viewCount: number;

  @ApiProperty({ description: 'Number of applications submitted on this date' })
  applicationCount: number;

  @ApiProperty({ description: 'Number of responses received on this date' })
  responseCount: number;

  @ApiProperty({ description: 'Average time to hire for hires closed on this date (days)' })
  averageTimeToHire: number;
}
