import nodemailer, { Transporter } from 'nodemailer';
import axios from 'axios';
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
    console.log(config.mail.strategy);
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
      if (config.mail.strategy.toLowerCase() === 'api') {
        return await this.sendViaAPI({
          to,
          subject,
          text,
          htmlContent,
          fromName,
          fromEmail,
        });
      } else if (config.mail.strategy.toLowerCase() === 'smtp') {
        return await this.sendViaSMTP({
          to,
          subject,
          text,
          htmlContent,
          fromName,
          fromEmail,
        });
      } else {
        throw new ErrorResponse('Invalid email strategy');
      }
    } catch (error) {
      logger.error('Error sending email', error as Error);
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

  private async sendViaAPI({
    to,
    subject,
    text,
    htmlContent,
    fromName,
    fromEmail,
  }: {
    to: string;
    subject: string;
    text?: string;
    htmlContent?: string;
    fromName?: string;
    fromEmail?: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    try {
      const payload: any = {
        from: `${fromName || config.mail.fromName} <${config.mail.from}>`,
        to: [to],
        subject,
      };

      if (htmlContent) {
        payload.html = htmlContent;
      }
      if (text) {
        payload.text = text;
      }

      await axios.post(config.mail.apiHost, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.mail.apiToken}`,
        },
      });

      return { success: true };
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        apiResponse: error.response?.data,
        requestUrl: config.mail.apiHost,
        recipient: to,
      };

      console.error('Error sending email via API', {
        message: errorDetails,
        stack: error.stack,
      });

      return {
        success: false,
        error: new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Failed to send email via API',
          [
            error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              'Please try again later.',
          ],
          error,
        ),
      };
    }
  }

  private async sendViaSMTP({
    to,
    subject,
    text,
    htmlContent,
    fromName,
    fromEmail,
  }: {
    to: string;
    subject: string;
    text?: string;
    htmlContent?: string;
    fromName?: string;
    fromEmail?: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    try {
      const mailOptions = {
        from: `"${fromName || config.mail.fromName}" <${
          fromEmail || config.mail.from
        }>`,
        to,
        subject,
        text,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      logger.error('Error sending email via SMTP', error as Error);
      return {
        success: false,
        error: new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Failed to send email via SMTP',
          ['Please try again later.'],
          error as Error,
        ),
      };
    }
  }
}

export default new MailService();
