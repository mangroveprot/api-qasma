import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../../../core/config';
import { ErrorResponseType, SuccessResponseType } from '../../types';
import { logger } from '../logger.service';
import { ErrorResponse } from '../../utils';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.runningProd && config.mail.port === 465,
      auth: config.runningProd
        ? {
            user: config.mail.user,
            pass: config.mail.pass,
          }
        : undefined,
    });
  }

  async sendMail({
    to,
    subject,
    text,
    htmlTemplate,
    templateData,
    fromName,
    fromEmail,
  }: {
    to: string;
    subject: string;
    text?: string;
    htmlTemplate?: string;
    templateData?: Record<string, any>;
    fromName?: string;
    fromEmail?: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    try {
      let htmlContent;
      if (htmlTemplate) {
        const templatePath = path.join(
          __dirname,
          '../../templates/',
          `${htmlTemplate}.html`,
        );
        const templateSource = fs.readFileSync(templatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        htmlContent = template(templateData);
      }

      const mailOptions = {
        from: `"${fromName || config.mail.fromName}" <${
          fromEmail || config.mail.from
        }>`,
        to,
        subject,
        text,
        html: htmlContent,
      };
      console.log(config.mail);
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      logger.error('Error sending email', error as Error);
      console.log(error);
      return {
        success: false,
        error: new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Failed to send email',
          ['Please try again later.'],
          error as Error,
        ),
      };
    }
  }
}

export default new MailService();
