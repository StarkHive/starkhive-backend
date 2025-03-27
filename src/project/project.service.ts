import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull, Not } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
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
import { Project, ProjectStatus } from './entities/project.entity';
import { Milestone, MilestoneStatus } from './entities/milestone.entity';
import { Deliverable, DeliverableStatus } from './entities/deliverable.entity';
import { Task, TaskStatus } from './entities/task.entity';
import { FileAttachment } from './entities/file-attachment.entity';
import { TimeLog } from './entities/time-log.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    
    @InjectRepository(Deliverable)
    private deliverableRepository: Repository<Deliverable>,
    
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    
    @InjectRepository(FileAttachment)
    private fileAttachmentRepository: Repository<FileAttachment>,
    
    @InjectRepository(TimeLog)
    private timeLogRepository: Repository<TimeLog>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Project methods
  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAllProjects(
    status?: string,
    clientId?: string,
    projectManagerId?: string,
  ): Promise<Project[]> {
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (clientId) {
      query.clientId = clientId;
    }
    
    if (projectManagerId) {
      query.projectManagerId = projectManagerId;
    }
    
    return this.projectRepository.find({
      where: query,
      relations: ['client', 'projectManager'],
      order: { createdAt: 'DESC' },
    });
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'client',
        'projectManager',
        'milestones',
        'deliverables',
        'tasks',
        'files',
      ],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    
    return project;
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findProjectById(id);
    
    // Update project with new values
    Object.assign(project, updateProjectDto);
    
    return this.projectRepository.save(project);
  }

  async removeProject(id: string): Promise<void> {
    const project = await this.findProjectById(id);
    await this.projectRepository.remove(project);
  }

  // Milestone methods
  async createMilestone(
    createMilestoneDto: CreateMilestoneDto,
  ): Promise<Milestone> {
    // Check if project exists
    await this.findProjectById(createMilestoneDto.projectId);
    
    // Create and save milestone
    const milestone = this.milestoneRepository.create(createMilestoneDto);
    return this.milestoneRepository.save(milestone);
  }

  async findMilestoneById(id: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['project', 'deliverables'],
    });
    
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID "${id}" not found`);
    }
    
    return milestone;
  }

  async findMilestonesByProject(projectId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { projectId },
      order: { order: 'ASC' },
      relations: ['deliverables'],
    });
  }

  async updateMilestone(
    id: string,
    updateMilestoneDto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    const milestone = await this.findMilestoneById(id);
    
    // Update milestone status if completed
    if (
      updateMilestoneDto.status === MilestoneStatus.COMPLETED &&
      milestone.status !== MilestoneStatus.COMPLETED
    ) {
      updateMilestoneDto.completedAt = new Date();
    }
    
    // Update milestone with new values
    Object.assign(milestone, updateMilestoneDto);
    
    return this.milestoneRepository.save(milestone);
  }

  async removeMilestone(id: string): Promise<void> {
    const milestone = await this.findMilestoneById(id);
    await this.milestoneRepository.remove(milestone);
  }

  // Deliverable methods
  async createDeliverable(
    createDeliverableDto: CreateDeliverableDto,
  ): Promise<Deliverable> {
    // Check if project exists
    await this.findProjectById(createDeliverableDto.projectId);
    
    // Check if milestone exists if provided
    if (createDeliverableDto.milestoneId) {
      await this.findMilestoneById(createDeliverableDto.milestoneId);
    }
    
    // Create and save deliverable
    const deliverable = this.deliverableRepository.create(createDeliverableDto);
    return this.deliverableRepository.save(deliverable);
  }

  async findDeliverableById(id: string): Promise<Deliverable> {
    const deliverable = await this.deliverableRepository.findOne({
      where: { id },
      relations: ['project', 'milestone', 'files'],
    });
    
    if (!deliverable) {
      throw new NotFoundException(`Deliverable with ID "${id}" not found`);
    }
    
    return deliverable;
  }

  async findDeliverablesByProject(projectId: string): Promise<Deliverable[]> {
    return this.deliverableRepository.find({
      where: { projectId },
      relations: ['milestone', 'files'],
      order: { dueDate: 'ASC' },
    });
  }

  async findDeliverablesByMilestone(
    milestoneId: string,
  ): Promise<Deliverable[]> {
    return this.deliverableRepository.find({
      where: { milestoneId },
      relations: ['files'],
      order: { dueDate: 'ASC' },
    });
  }

  async updateDeliverable(
    id: string,
    updateDeliverableDto: UpdateDeliverableDto,
  ): Promise<Deliverable> {
    const deliverable = await this.findDeliverableById(id);
    
    // Set timestamps based on status changes
    if (
      updateDeliverableDto.status === DeliverableStatus.SUBMITTED &&
      deliverable.status !== DeliverableStatus.SUBMITTED
    ) {
      updateDeliverableDto.submittedAt = new Date();
    } else if (
      updateDeliverableDto.status === DeliverableStatus.APPROVED &&
      deliverable.status !== DeliverableStatus.APPROVED
    ) {
      updateDeliverableDto.approvedAt = new Date();
    }
    
    // Update deliverable with new values
    Object.assign(deliverable, updateDeliverableDto);
    
    return this.deliverableRepository.save(deliverable);
  }

  async removeDeliverable(id: string): Promise<void> {
    const deliverable = await this.findDeliverableById(id);
    await this.deliverableRepository.remove(deliverable);
  }

  // Task methods
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // Check if project exists
    await this.findProjectById(createTaskDto.projectId);
    
    // Check if parent task exists if provided
    if (createTaskDto.parentTaskId) {
      await this.findTaskById(createTaskDto.parentTaskId);
    }
    
    // Create task
    const task = this.taskRepository.create(createTaskDto);
    
    // Save task first to get an ID
    const savedTask = await this.taskRepository.save(task);
    
    // Add assignees if provided
    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      const assignees = await this.userRepository.findByIds(
        createTaskDto.assigneeIds,
      );
      
      if (assignees.length !== createTaskDto.assigneeIds.length) {
        throw new BadRequestException('Some assignee IDs are invalid');
      }
      
      savedTask.assignees = assignees;
      return this.taskRepository.save(savedTask);
    }
    
    return savedTask;
  }

  async findTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignees', 'parentTask', 'subtasks', 'files'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    
    return task;
  }

  async findTasksByProject(
    projectId: string,
    status?: string,
  ): Promise<Task[]> {
    const query: any = { projectId, parentTaskId: IsNull() };
    
    if (status) {
      query.status = status;
    }
    
    return this.taskRepository.find({
      where: query,
      relations: ['assignees', 'subtasks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSubtasks(taskId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { parentTaskId: taskId },
      relations: ['assignees'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findTaskById(id);
    
    // Set completedAt date if status changed to DONE
    if (
      updateTaskDto.status === TaskStatus.DONE &&
      task.status !== TaskStatus.DONE
    ) {
      updateTaskDto.completedAt = new Date();
    }
    
    // Update assignees if provided
    if (updateTaskDto.assigneeIds) {
      const assignees = await this.userRepository.findByIds(
        updateTaskDto.assigneeIds,
      );
      
      if (assignees.length !== updateTaskDto.assigneeIds.length) {
        throw new BadRequestException('Some assignee IDs are invalid');
      }
      
      task.assignees = assignees;
      delete updateTaskDto.assigneeIds;
    }
    
    // Update task with new values
    Object.assign(task, updateTaskDto);
    
    return this.taskRepository.save(task);
  }

  async removeTask(id: string): Promise<void> {
    const task = await this.findTaskById(id);
    await this.taskRepository.remove(task);
  }

  // File attachment methods
  async uploadFile(
    file: Express.Multer.File,
    createFileAttachmentDto: CreateFileAttachmentDto,
  ): Promise<FileAttachment> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuid()}${fileExtension}`;
      const filePath = path.join('uploads', fileName);
      
      // Write file to disk
      fs.writeFileSync(path.join(process.cwd(), filePath), file.buffer);
      
      // Create file record in database
      const fileAttachment = this.fileAttachmentRepository.create({
        ...createFileAttachmentDto,
        fileName,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
      });
      
      return this.fileAttachmentRepository.save(fileAttachment);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async findFileById(id: string): Promise<FileAttachment> {
    const file = await this.fileAttachmentRepository.findOne({
      where: { id },
      relations: ['project', 'task', 'deliverable', 'uploadedBy'],
    });
    
    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }
    
    return file;
  }

  async findFilesByProject(projectId: string): Promise<FileAttachment[]> {
    return this.fileAttachmentRepository.find({
      where: { projectId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFilesByTask(taskId: string): Promise<FileAttachment[]> {
    return this.fileAttachmentRepository.find({
      where: { taskId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFilesByDeliverable(
    deliverableId: string,
  ): Promise<FileAttachment[]> {
    return this.fileAttachmentRepository.find({
      where: { deliverableId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateFile(
    id: string,
    updateFileAttachmentDto: UpdateFileAttachmentDto,
  ): Promise<FileAttachment> {
    const file = await this.findFileById(id);
    
    // Update file with new values
    Object.assign(file, updateFileAttachmentDto);
    
    return this.fileAttachmentRepository.save(file);
  }

  async removeFile(id: string): Promise<void> {
    const file = await this.findFileById(id);
    
    try {
      // Delete physical file
      const filePath = path.join(process.cwd(), file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove database record
      await this.fileAttachmentRepository.remove(file);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // Time log methods
  async createTimeLog(createTimeLogDto: CreateTimeLogDto): Promise<TimeLog> {
    // Calculate duration if start and end times are provided
    if (createTimeLogDto.startTime && createTimeLogDto.endTime) {
      const startTime = new Date(createTimeLogDto.startTime);
      const endTime = new Date(createTimeLogDto.endTime);
      
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      createTimeLogDto.duration = parseFloat(durationHours.toFixed(2));
    }
    
    const timeLog = this.timeLogRepository.create(createTimeLogDto);
    return this.timeLogRepository.save(timeLog);
  }

  async findTimeLogById(id: string): Promise<TimeLog> {
    const timeLog = await this.timeLogRepository.findOne({
      where: { id },
      relations: ['project', 'task', 'user', 'approvedBy'],
    });
    
    if (!timeLog) {
      throw new NotFoundException(`Time log with ID "${id}" not found`);
    }
    
    return timeLog;
  }

  async findTimeLogsByProject(
    projectId: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeLog[]> {
    const query: any = { projectId };
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate && endDate) {
      query.startTime = Between(startDate, endDate);
    }
    
    return this.timeLogRepository.find({
      where: query,
      relations: ['user', 'task', 'approvedBy'],
      order: { startTime: 'DESC' },
    });
  }

  async findTimeLogsByTask(
    taskId: string,
    userId?: string,
  ): Promise<TimeLog[]> {
    const query: any = { taskId };
    
    if (userId) {
      query.userId = userId;
    }
    
    return this.timeLogRepository.find({
      where: query,
      relations: ['user', 'approvedBy'],
      order: { startTime: 'DESC' },
    });
  }

  async updateTimeLog(
    id: string,
    updateTimeLogDto: UpdateTimeLogDto,
  ): Promise<TimeLog> {
    const timeLog = await this.findTimeLogById(id);
    
    // Recalculate duration if start or end times changed
    if (
      (updateTimeLogDto.startTime || updateTimeLogDto.endTime) &&
      timeLog.endTime
    ) {
      const startTime = new Date(
        updateTimeLogDto.startTime || timeLog.startTime,
      );
      const endTime = new Date(updateTimeLogDto.endTime || timeLog.endTime);
      
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      updateTimeLogDto.duration = parseFloat(durationHours.toFixed(2));
    }
    
    // Update time log with new values
    Object.assign(timeLog, updateTimeLogDto);
    
    return this.timeLogRepository.save(timeLog);
  }

  async removeTimeLog(id: string): Promise<void> {
    const timeLog = await this.findTimeLogById(id);
    await this.timeLogRepository.remove(timeLog);
  }

  async approveTimeLog(id: string, approvedById: string): Promise<TimeLog> {
    const timeLog = await this.findTimeLogById(id);
    
    timeLog.isApproved = true;
    timeLog.approvedAt = new Date();
    timeLog.approvedById = approvedById;
    
    return this.timeLogRepository.save(timeLog);
  }
} 