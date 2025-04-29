// src/reputation/reputation.service.ts

import { Injectable } from '@nestjs/common';
import { EndorsementService } from '@src/endorsement/endorsement.service';
import { ProjectService } from '@src/project/project.service'; 
import { RatingsService } from '@src/rating/rating.service'; 
import { TimelineEvent } from '../interfaces/timeline-event.interface'; 

@Injectable()
export class ReputationService {
  constructor(
    private readonly endorsementsService: EndorsementService,
    private readonly projectsService: ProjectService,
    private readonly ratingsService: RatingsService,
  ) {}

  async getUserTimeline(userId: string, page = 1, limit = 10) {
    // 1. Fetch all event types
    const [endorsements, projects, ratings] = await Promise.all([
      this.endorsementsService.getUserEndorsements(userId),
      this.projectsService.getUserProjects(userId),
      this.ratingsService.getUserRatings(userId),
    ]);

    // 2. Normalize events into TimelineEvent type
    const allEvents: TimelineEvent[] = [
      ...endorsements.map((e: { endorserName: any; message: any; date: string | number | Date; }) => ({
        type: 'endorsement',
        title: `Endorsed by ${e.endorserName}`,
        description: e.message || 'Received an endorsement.',
        date: new Date(e.date),
      })),
      ...projects.map((p: { projectName: any; description: any; completedAt: string | number | Date; }) => ({
        type: 'project',
        title: `Completed project: ${p.projectName}`,
        description: p.description || 'Successfully completed a project.',
        date: new Date(p.completedAt),
      })),
      ...ratings.map((r) => ({
        type: 'rating',
        title: `Rated ${r.ratingValue} Stars`,
        description: r.description || 'Received a client rating.',
        date: new Date(r.date),
      })),
    ];

    // 3. Sort by date descending (most recent first)
    allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 4. Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = allEvents.slice(startIndex, endIndex);

    // 5. Return the result
    return {
      page,
      limit,
      totalEvents: allEvents.length,
      totalPages: Math.ceil(allEvents.length / limit),
      events: paginatedEvents,
    };
  }
}
