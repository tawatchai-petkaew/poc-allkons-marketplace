import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import {
  SendChangePasswordSuccess,
  SendRegisterVerifyEmail,
  SendResetPasswordEmail,
  sendVerifyEmailSuccess
} from './mail.type';

import fs = require('fs');
require('dotenv').config();

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegisterVerifyEmail(props: SendRegisterVerifyEmail) {
    await this.mailerService
      .sendMail({
        to: props.email,
        from: 'Support Team <support@shopdit.com>',
        subject: `กรุณายืนยันอีเมลบัญชี ${props.slug} ของคุณ`,
        template: './customerVerifyEmail',
        context: {
          name: props.name,
          redirectUrl: props.redirectUrl,
          merchantLogo: props.merchantLogo,
          slug: props.slug,
          rootUrl: props.rootUrl,
          merchantEmail: props.merchantEmail
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendResetPasswordEmail(props: SendResetPasswordEmail) {
    await this.mailerService
      .sendMail({
        to: props.email,
        from: 'Support Team <support@shopdit.com>',
        subject: `รีเซ็ตรหัสผ่านบัญชี ${props.slug}`,
        template: './customerResetPasswordEmail',
        context: {
          name: props.name,
          redirectUrl: props.redirectUrl,
          merchantLogo: props.merchantLogo,
          slug: props.slug,
          rootUrl: props.rootUrl,
          merchantEmail: props.merchantEmail
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendChangePasswordSuccess(props: SendChangePasswordSuccess) {
    await this.mailerService
      .sendMail({
        to: props.email,
        from: 'Support Team <support@shopdit.com>',
        subject: `เปลี่ยนรหัสผ่านบัญชี ${props.slug} สำเร็จ`,
        template: './customerChangePasswordSuccess',
        context: {
          name: props.name,
          merchantLogo: props.merchantLogo,
          slug: props.slug,
          rootUrl: props.rootUrl,
          merchantEmail: props.merchantEmail
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }

  async sendVerifyEmailSuccess(props: sendVerifyEmailSuccess) {
    await this.mailerService
      .sendMail({
        to: props.email,
        from: 'Support Team <support@shopdit.com>',
        subject: `ยินดีต้อนรับสู่ ${props.slug}`,
        template: './customerVerifyEmailSuccess',
        context: {
          name: props.name,
          merchantLogo: props.merchantLogo,
          slug: props.slug,
          rootUrl: props.rootUrl,
          merchantEmail: props.merchantEmail
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log('Error : ', err);
      });
  }
}
