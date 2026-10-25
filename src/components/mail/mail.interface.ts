export interface SendOption {
  recipients: string[];
  subject: string;
  from?: string;
  text?: string;
  /** Compiled HTML */
  template?: string;
}

export interface MailQueueOptions {
  /** Number of times to attempt to send an email until it's successfully sent */
  attempts?: number;
}

export interface BaseTemplateInput {
  /** An array of email addresses */
  recipients: string[];
}

export interface PasswordResetRequestMailInput extends BaseTemplateInput {
  data: {
    passwordResetCode: string;
  };
}

export interface OrganizationAdminOnboardingMailInput extends BaseTemplateInput {
  data: {
    firstName: string;
    email: string;
    organizationName: string;
    clientId: string;
    temporaryPassword: string;
  };
}

export interface DepartmentChangeMailInput extends BaseTemplateInput {
  data: {
    firstName: string;
    organizationName: string;
    departmentName: string;
    /** Null when the user had no department before */
    previousDepartmentName: string | null;
  };
}
