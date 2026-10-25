import * as path from 'path';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobQueueList } from '../../shared/enums/queue.enum';
import {
  DepartmentChangeMailInput,
  MailQueueOptions,
  OrganizationAdminOnboardingMailInput,
  PasswordResetRequestMailInput,
  SendOption,
} from './mail.interface';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

@Injectable()
export class MailService {
  private readonly from = `"HealthBridge" <${process.env.MAIL_FROM}>`;
  private readonly templates = new Map<string, HandlebarsTemplateDelegate>();
  private readonly transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USERNAME
      ? { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  constructor(
    @InjectQueue(JobQueueList.MAIL)
    private readonly mailQueue: Queue<SendOption>,
  ) {}

  /**
   * Pushes a mail into the queue with optional retry
   */
  async queueMail(
    payload: SendOption,
    options: MailQueueOptions = {},
  ): Promise<void> {
    await this.mailQueue.add('send', payload, {
      attempts: options.attempts || 1,
      backoff: { type: 'exponential', delay: 3000 },
    });
  }

  private compile(templateName: string): HandlebarsTemplateDelegate {
    let template = this.templates.get(templateName);

    if (!template) {
      const file = fs.readFileSync(
        path.join(TEMPLATES_DIR, `${templateName}.hbs`),
        'utf8',
      );
      template = handlebars.compile(file);
      this.templates.set(templateName, template);
    }

    return template;
  }

  /**
   * Composes a mail's HTML from a template in the `templates` directory,
   * wrapped in the shared layout.
   */
  composeTemplate(templateName: string, subject: string, data: object): string {
    const content = this.compile(templateName)(data);

    return this.compile('layout')({
      ...data,
      content,
      title: subject,
      year: new Date().getFullYear(),
    });
  }

  /**
   * Sends an email immediately. Prefer `queueMail` from request handlers.
   */
  async send(options: SendOption) {
    await this.transport.sendMail({
      from: options.from || this.from,
      to: options.recipients,
      subject: options.subject,
      text: options.text,
      html: options.template,
    });
  }

  async sendPasswordResetRequestMail(
    options: PasswordResetRequestMailInput,
  ): Promise<void> {
    const subject = 'HealthBridge - Password Reset';
    const template = this.composeTemplate(
      'password-reset-request',
      subject,
      options.data,
    );
    await this.queueMail(
      { recipients: options.recipients, subject, template },
      { attempts: 10 },
    );
  }

  async sendOrganizationAdminOnboardingMail(
    options: OrganizationAdminOnboardingMailInput,
  ): Promise<void> {
    const subject = 'Your HealthBridge organization account';
    const template = this.composeTemplate(
      'organization-admin-onboarding',
      subject,
      options.data,
    );
    await this.queueMail(
      { recipients: options.recipients, subject, template },
      { attempts: 10 },
    );
  }

  async sendDepartmentChangeMail(
    options: DepartmentChangeMailInput,
  ): Promise<void> {
    const subject = 'HealthBridge - Your department has changed';
    const template = this.composeTemplate(
      'department-change',
      subject,
      options.data,
    );
    await this.queueMail(
      { recipients: options.recipients, subject, template },
      { attempts: 10 },
    );
  }
}
