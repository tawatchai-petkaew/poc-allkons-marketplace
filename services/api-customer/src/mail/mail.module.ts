import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { MailService } from './mail.service';
import { MailService as PublicService } from './public/mail.service';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        // transport: {
        //   host: config.get('MAILER_HOST'),
        //   secure: false,
        //   connectionTimeout: 60000,
        //   greetingTimeout: 60000,
        //   auth: {
        //     user: config.get('MAILER_USER'),
        //     pass: config.get('MAILER_PASSWORD'),
        //   },
        // },
        // defaults: {
        //   from: `"No Reply" <${config.get('MAILER_FROM')}>`,
        // },
        transport: {
          // SES: new AWS.SES({
          //   region: config.get('AWS_SES_REGION'),
          //   accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
          //   secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY')
          // }),
          host: config.get('ALLKONS_MAILER_HOST'),
          port: config.get('ALLKONS_MAILER_PORT'),
          secure: false,
          ignoreTLS: true,
          requireTLS: false,
          auth: {
            user: config.get('ALLKONS_MAILER_USER'),
            pass: config.get('ALLKONS_MAILER_PASSWORD'),
          },
          debug: true,
        },
        defaults: {
          from: `"${config.get('ALLKONS_MAIL_FROM_NAME')}" <${config.get(
            'ALLKONS_MAIL_FROM_ADDRESS',
          )}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, PublicService],
  exports: [MailService, PublicService],
})
export class MailModule {}
