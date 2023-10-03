import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import envConfig from '../../config/env.config';

@Injectable()
export class SendGridService {
  constructor() {
    SendGrid.setApiKey(envConfig.sendGrid.key);
  }

  async sendMail(mail: SendGrid.MailDataRequired) {
    try {
      return await SendGrid.send(mail);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
