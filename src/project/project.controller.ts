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

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // Project endpoints
  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.createProject(createProjectDto);
  }

  @Get()
  findAllProjects(
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('projectManagerId') projectManagerId?: string,
  ) {
    return this.projectService.findAllProjects(status, clientId, projectManagerId);
  }

  @Get(':id')
  findProjectById(@Param('id') id: string) {
    return this.projectService.findProjectById(id);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  removeProject(@Param('id') id: string) {
    return this.projectService.removeProject(id);
  }

  // Milestone endpoints
  @Post('milestones')
  createMilestone(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.projectService.createMilestone(createMilestoneDto);
  }

  @Get('milestones/:id')
  findMilestoneById(@Param('id') id: string) {
    return this.projectService.findMilestoneById(id);
  }

  @Get(':projectId/milestones')
  findMilestonesByProject(@Param('projectId') projectId: string) {
    return this.projectService.findMilestonesByProject(projectId);
  }

  @Patch('milestones/:id')
  updateMilestone(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.projectService.updateMilestone(id, updateMilestoneDto);
  }

  @Delete('milestones/:id')
  removeMilestone(@Param('id') id: string) {
    return this.projectService.removeMilestone(id);
  }

  // Deliverable endpoints
  @Post('deliverables')
  createDeliverable(@Body() createDeliverableDto: CreateDeliverableDto) {
    return this.projectService.createDeliverable(createDeliverableDto);
  }

  @Get('deliverables/:id')
  findDeliverableById(@Param('id') id: string) {
    return this.projectService.findDeliverableById(id);
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
  updateDeliverable(
    @Param('id') id: string,
    @Body() updateDeliverableDto: UpdateDeliverableDto,
  ) {
    return this.projectService.updateDeliverable(id, updateDeliverableDto);
  }

  @Delete('deliverables/:id')
  removeDeliverable(@Param('id') id: string) {
    return this.projectService.removeDeliverable(id);
  }

  // Task endpoints
  @Post('tasks')
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.projectService.createTask(createTaskDto);
  }

  @Get('tasks/:id')
  findTaskById(@Param('id') id: string) {
    return this.projectService.findTaskById(id);
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
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.projectService.updateTask(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  removeTask(@Param('id') id: string) {
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
  findFileById(@Param('id') id: string) {
    return this.projectService.findFileById(id);
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
  updateFile(
    @Param('id') id: string,
    @Body() updateFileAttachmentDto: UpdateFileAttachmentDto,
  ) {
    return this.projectService.updateFile(id, updateFileAttachmentDto);
  }

  @Delete('files/:id')
  removeFile(@Param('id') id: string) {
    return this.projectService.removeFile(id);
  }

  // Time log endpoints
  @Post('time-logs')
  createTimeLog(@Body() createTimeLogDto: CreateTimeLogDto) {
    return this.projectService.createTimeLog(createTimeLogDto);
  }

  @Get('time-logs/:id')
  findTimeLogById(@Param('id') id: string) {
    return this.projectService.findTimeLogById(id);
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
  updateTimeLog(
    @Param('id') id: string,
    @Body() updateTimeLogDto: UpdateTimeLogDto,
  ) {
    return this.projectService.updateTimeLog(id, updateTimeLogDto);
  }

  @Delete('time-logs/:id')
  removeTimeLog(@Param('id') id: string) {
    return this.projectService.removeTimeLog(id);
  }

  @Post('time-logs/:id/approve')
  approveTimeLog(@Param('id') id: string, @Body('approvedById') approvedById: string) {
    return this.projectService.approveTimeLog(id, approvedById);
  }
} 