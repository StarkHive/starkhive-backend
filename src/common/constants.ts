export const MESSAGE_STATUSES = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5 MB

export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];