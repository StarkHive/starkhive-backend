import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateFileAttachmentDto } from './dto/create-file-attachment.dto';
import { UpdateFileAttachmentDto } from './dto/update-file-attachment.dto';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheService } from "@src/cache/cache.service";

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService, private cacheManager: CacheService) {}

  // Project endpoints
  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  async findAllProjects(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('projectManagerId') projectManagerId?: string,
  ) {
    const cachedProjects = await this.cacheManager.get(`projects:all:${status}:${clientId}:${projectManagerId}`, 'ProjectService');
    if (cachedProjects) {
      return cachedProjects;
    }
    const projects = await this.projectService.findAllProjects(status, clientId, projectManagerId);
    await this.cacheManager.set(`projects:all:${status}:${clientId}:${projectManagerId}`, projects);
    return projects;
  }

  @Get(':id')
  async findProjectById(@Param('id') id: string) {
    const cachedProject = await this.cacheManager.get(`projects:${id}`, 'ProjectService');
    if (cachedProject) {
      return cachedProject;
    }
    const project = await this.projectService.findProjectById(id);
    await this.cacheManager.set(`project:${id}`, project);
    return project;
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    await this.cacheManager.del(`project:${id}`);
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  async removeProject(@Param('id') id: string) {
    await this.cacheManager.del(`project:${id}`);
    return this.projectService.removeProject(id);
  }

  // Milestone endpoints
  @Post('milestones')
  createMilestone(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.projectService.createMilestone(createMilestoneDto);
  }

  @Get('milestones/:id')
  async findMilestoneById(@Param('id') id: string) {
    const cachedMilestone = await this.cacheManager.get(`projects:milestones:${id}`, 'ProjectService');
    if (cachedMilestone) {
      return cachedMilestone;
    }
    const milestone = await this.projectService.findMilestoneById(id);
    await this.cacheManager.set(`projects:milestones:${id}`, milestone);
    return milestone;
  }

  @Get(':projectId/milestones')
  findMilestonesByProject(@Param('projectId') projectId: string) {
    return this.projectService.findMilestonesByProject(projectId);
  }

  @Patch('milestones/:id')
  async updateMilestone(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    await this.cacheManager.del(`projects:milestones:${id}`);
    return this.projectService.updateMilestone(id, updateMilestoneDto);
  }

  @Delete('milestones/:id')
  async removeMilestone(@Param('id') id: string) {
    await this.cacheManager.del(`projects:milestones:${id}`);
    return this.projectService.removeMilestone(id);
  }

  // Deliverable endpoints
  @Post('deliverables')
  createDeliverable(@Body() createDeliverableDto: CreateDeliverableDto) {
    return this.projectService.createDeliverable(createDeliverableDto);
  }

  @Get('deliverables/:id')
  async findDeliverableById(@Param('id') id: string) {
    const cachedDeliverable = await this.cacheManager.get(`projects:deliverables:${id}`, 'ProjectService');
    if (cachedDeliverable) {
      return cachedDeliverable;
    }
    const deliverable = await this.projectService.findDeliverableById(id);
    await this.cacheManager.set(`projects:deliverables:${id}`, deliverable);
    return deliverable;
  }

  @Get(':projectId/deliverables')
  findDeliverablesByProject(@Param('projectId') projectId: string) {
    return this.projectService.findDeliverablesByProject(projectId);
  }

  @Get('milestones/:milestoneId/deliverables')
  findDeliverablesByMilestone(@Param('milestoneId') milestoneId: string) {
    return this.projectService.findDeliverablesByMilestone(milestoneId);
  }

  @Patch('deliverables/:id')
  async updateDeliverable(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto,
  ) {
    await this.cacheManager.del(`projects:deliverables:${id}`);
    return this.projectService.updateDeliverable(id, updateDeliverableDto);
  }

  @Delete('deliverables/:id')
  async removeDeliverable(@Param('id') id: string) {
    await this.cacheManager.del(`projects:deliverables:${id}`);
    return this.projectService.removeDeliverable(id);
  }

  // Task endpoints
  @Post('tasks')
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.projectService.createTask(createTaskDto);
  }

  @Get('tasks/:id')
  async findTaskById(@Param('id') id: string) {
    const cachedTask = await this.cacheManager.get(`projects:tasks:${id}`, 'ProjectService');
    if (cachedTask) {
      return cachedTask;
    }
    const task = await this.projectService.findTaskById(id);
    await this.cacheManager.set(`projects:tasks:${id}`, task);
    return task;
  }

  @Get(':projectId/tasks')
  findTasksByProject(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.projectService.findTasksByProject(projectId, status);
  }

  @Get('tasks/:taskId/subtasks')
  findSubtasks(@Param('taskId') taskId: string) {
    return this.projectService.findSubtasks(taskId);
  }

  @Patch('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    await this.cacheManager.del(`projects:tasks:${id}`);
    return this.projectService.updateTask(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  async removeTask(@Param('id') id: string) {
    await this.cacheManager.del(`projects:tasks:${id}`);
    return this.projectService.removeTask(id);
  }

  // File attachment endpoints
  @Post('files')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileAttachmentDto: CreateFileAttachmentDto,
  ) {
    return this.projectService.uploadFile(file, createFileAttachmentDto);
  }

  @Get('files/:id')
  async findFileById(@Param('id') id: string) {
    const cachedFile = await this.cacheManager.get(`projects:files:${id}`, 'ProjectService');
    if (cachedFile) {
      return cachedFile;
    }
    const file = await this.projectService.findFileById(id);
    await this.cacheManager.set(`projects:files:${id}`, file);
    return file;
  }

  @Get(':projectId/files')
  findFilesByProject(@Param('projectId') projectId: string) {
    return this.projectService.findFilesByProject(projectId);
  }

  @Get('tasks/:taskId/files')
  findFilesByTask(@Param('taskId') taskId: string) {
    return this.projectService.findFilesByTask(taskId);
  }

  @Get('deliverables/:deliverableId/files')
  findFilesByDeliverable(@Param('deliverableId') deliverableId: string) {
    return this.projectService.findFilesByDeliverable(deliverableId);
  }

  @Patch('files/:id')
  async updateFile(
    @Param('id') id: string,
    @Body() updateFileAttachmentDto: UpdateFileAttachmentDto,
  ) {
    await this.cacheManager.del(`projects:files:${id}`);
    return this.projectService.updateFile(id, updateFileAttachmentDto);
  }

  @Delete('files/:id')
  async removeFile(@Param('id') id: string) {
    await this.cacheManager.del(`projects:files:${id}`);
    return this.projectService.removeFile(id);
  }

  // Time log endpoints
  @Post('time-logs')
  createTimeLog(@Body() createTimeLogDto: CreateTimeLogDto) {
    return this.projectService.createTimeLog(createTimeLogDto);
  }

  @Get('time-logs/:id')
  async findTimeLogById(@Param('id') id: string) {
    const cachedTimeLogs = await this.cacheManager.get(`projects:time-logs:${id}`, 'ProjectService');
    if (cachedTimeLogs) {
      return cachedTimeLogs;
    }

    const timeLogs = await this.projectService.findTimeLogById(id);
    await this.cacheManager.set(`projects:time-logs:${id}`, timeLogs);
    return timeLogs;
  }

  @Get(':projectId/time-logs')
  findTimeLogsByProject(
    @Param('projectId') projectId: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.projectService.findTimeLogsByProject(
      projectId,
      userId,
      startDate,
      endDate,
    );
  }

  @Get('tasks/:taskId/time-logs')
  findTimeLogsByTask(
    @Param('taskId') taskId: string,
    @Query('userId') userId?: string,
  ) {
    return this.projectService.findTimeLogsByTask(taskId, userId);
  }

  @Patch('time-logs/:id')
  async updateTimeLog(
    @Param('id') id: string,
    @Body() updateTimeLogDto: UpdateTimeLogDto,
  ) {
    await this.cacheManager.del(`projects:time-logs:${id}`);
    return this.projectService.updateTimeLog(id, updateTimeLogDto);
  }

  @Delete('time-logs/:id')
  async removeTimeLog(@Param('id') id: string) {
    await this.cacheManager.del(`projects:time-logs:${id}`);
    return this.projectService.removeTimeLog(id);
  }

  @Post('time-logs/:id/approve')
  approveTimeLog(@Param('id') id: string, @Body('approvedById') approvedById: string) {
    return this.projectService.approveTimeLog(id, approvedById);
  }
} 