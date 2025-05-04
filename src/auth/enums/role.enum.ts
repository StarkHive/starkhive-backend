export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  FREELANCER = 'freelancer',
  COMPANY = 'company',
  SECURITY_AUDITOR = 'security_auditor',
  JURY = 'jury',
}

export enum Permission {
  MANAGE_USERS = 'manage_users',
  CREATE_PROJECT = 'create_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  VIEW_PROJECT = 'view_project',
}
