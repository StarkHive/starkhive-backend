/* eslint-disable prettier/prettier */
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  FREELANCER = 'freelancer',
  COMPANY = 'company',
  SECURITY_AUDITOR = 'security_auditor',
}

export enum Permission {
  CREATE_PROJECT = 'create_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  VIEW_PROJECT = 'view_project',
  MANAGE_USERS = 'manage_users',
}
