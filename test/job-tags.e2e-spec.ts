import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobTag } from '../src/job-tags/entities/job-tag.entity';
import { TagVote } from '../src/job-tags/entities/tag-vote.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('JobTagsController (e2e)', () => {
  let app: INestApplication;
  let jobTagRepository: Repository<JobTag>;
  let tagVoteRepository: Repository<TagVote>;
  let jwtService: JwtService;

  // Test data
  const testUser = { id: 'user-123', email: 'test@example.com' };
  const testJob = { id: 'job-123', title: 'Software Engineer' };
  let authToken: string;
  let createdTagId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    jobTagRepository = moduleFixture.get<Repository<JobTag>>(
      getRepositoryToken(JobTag),
    );
    tagVoteRepository = moduleFixture.get<Repository<TagVote>>(
      getRepositoryToken(TagVote),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create JWT token for authentication
    authToken = jwtService.sign({ sub: testUser.id, email: testUser.email });

    await app.init();

    // Clean up database before tests
    await tagVoteRepository.delete({});
    await jobTagRepository.delete({});

    // Seed test job (assuming you have a job repository)
    // await jobRepository.save(testJob);
  });

  afterAll(async () => {
    // Clean up database after tests
    await tagVoteRepository.delete({});
    await jobTagRepository.delete({});
    await app.close();
  });

  describe('/job-tags/submit (POST)', () => {
    it('should create a new tag', () => {
      return request(app.getHttpServer())
        .post('/job-tags/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Remote',
          description: 'Work from anywhere',
          jobId: testJob.id,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('remote');
          expect(res.body.description).toBe('Work from anywhere');
          expect(res.body.jobId).toBe(testJob.id);
          expect(res.body.upvotes).toBe(0);
          expect(res.body.downvotes).toBe(0);
          expect(res.body.confidenceScore).toBe(0);

          // Save tag ID for later tests
          createdTagId = res.body.id;
        });
    });

    it('should reject duplicate tag', () => {
      return request(app.getHttpServer())
        .post('/job-tags/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Remote',
          description: 'Work from anywhere',
          jobId: testJob.id,
        })
        .expect(409);
    });

    it('should reject invalid input', () => {
      return request(app.getHttpServer())
        .post('/job-tags/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Empty name should be rejected
          jobId: testJob.id,
        })
        .expect(400);
    });
  });

  describe('/job-tags/vote/:tagId (PATCH)', () => {
    it('should add an upvote to a tag', () => {
      return request(app.getHttpServer())
        .patch(`/job-tags/vote/${createdTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voteType: 'upvote',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.upvotes).toBe(1);
          expect(res.body.downvotes).toBe(0);
          expect(res.body.confidenceScore).toBeGreaterThan(0);
        });
    });

    it('should change vote from upvote to downvote', () => {
      return request(app.getHttpServer())
        .patch(`/job-tags/vote/${createdTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voteType: 'downvote',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.upvotes).toBe(0);
          expect(res.body.downvotes).toBe(1);
        });
    });

    it('should remove vote when voting the same way again', () => {
      return request(app.getHttpServer())
        .patch(`/job-tags/vote/${createdTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voteType: 'downvote',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.upvotes).toBe(0);
          expect(res.body.downvotes).toBe(0);
        });
    });

    it('should reject invalid vote type', () => {
      return request(app.getHttpServer())
        .patch(`/job-tags/vote/${createdTagId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voteType: 'invalid',
        })
        .expect(400);
    });

    it('should reject vote on non-existent tag', () => {
      return request(app.getHttpServer())
        .patch('/job-tags/vote/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          voteType: 'upvote',
        })
        .expect(404);
    });
  });

  describe('/job-tags (GET)', () => {
    it('should get tags for a job', () => {
      return request(app.getHttpServer())
        .get(`/job-tags?jobId=${testJob.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('confidenceScore');
        });
    });

    it('should return empty array for job with no tags', () => {
      return request(app.getHttpServer())
        .get('/job-tags?jobId=non-existent-job-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should reject invalid job ID', () => {
      return request(app.getHttpServer())
        .get('/job-tags?jobId=invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
