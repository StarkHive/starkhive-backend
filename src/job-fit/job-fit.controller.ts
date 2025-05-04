import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { JobFitService } from './job-fit.service';

@Controller('job-fit')
export class JobFitController {
    constructor(private readonly jobFitService: JobFitService) {}

    @Get(':userId/:jobId')
    async getJobFitScore(@Param('userId') userId: string, @Param('jobId') jobId: string) {
        try {
            const score = await this.jobFitService.computeJobFitScore(userId, jobId);
            return { score };
        } catch (error) {
            const message = (error instanceof Error && error.message) ? error.message : 'Failed to compute job fit score';
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
    }
}
