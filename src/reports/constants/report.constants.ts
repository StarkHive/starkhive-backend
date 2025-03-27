// src/reports/constants/report.constants.ts
export const REPORT_CATEGORIES = {
    INAPPROPRIATE_CONTENT: 'inappropriate_content',
    FRAUD: 'fraud',
    POLICY_VIOLATION: 'policy_violation',
  };
  
  export const REPORT_REASONS = {
    [REPORT_CATEGORIES.INAPPROPRIATE_CONTENT]: [
      'Offensive language',
      'Hate speech',
      'Explicit content',
    ],
    [REPORT_CATEGORIES.FRAUD]: [
      'Scam',
      'Misleading information',
      'Financial fraud',
    ],
    [REPORT_CATEGORIES.POLICY_VIOLATION]: [
      'Spam',
      'Unauthorized advertising',
      'Other policy violation',
    ],
  };