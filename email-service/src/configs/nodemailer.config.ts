import nodemailer, { SendMailOptions } from 'nodemailer';
import env from './env.config';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

import { Resend } from 'resend';
import { compileHbs } from '../libs/compile-hbs.lib';

interface EmailProps {
  receiverEmail: string;
  emailTemplate: string;
  subject: string;
  context: Record<string, any>;
}

// export interface HbsMailOptions extends SendMailOptions {
//   template?: string;
//   context?: Record<string, any>;
// }

// export const sendEmail = (
//   { receiverEmail, emailTemplate, context, subject }: EmailProps,
//   callback: Function,
// ) => {
//   const email_user = env.EMAIL_USER;
//   const email_from = env.EMAIL_FROM;
//   const email_password = env.EMAIL_PASSWORD;
//   const tranporter = nodemailer.createTransport({
//     service: 'resend',
//     host: 'smtp.resend.com',
//     port: 587,
//     secure: true,
//     auth: {
//       user: email_user,
//       pass: email_password,
//     },
//   });

//   // handlebar middleware for templates
//   const templatesDir = path.join(process.cwd(), 'templates');

//   tranporter.use(
//     'compile',
//     hbs({
//       viewEngine: {
//         extname: '.hbs',
//         layoutsDir: templatesDir,
//         partialsDir: path.join(templatesDir, 'partials'),
//         defaultLayout: false,
//       },
//       viewPath: templatesDir,
//       extName: '.hbs',
//     }),
//   );

//   const mailOptions: HbsMailOptions = {
//     from: email_from,
//     to: receiverEmail,
//     subject: subject,
//     template: emailTemplate,
//     context: { ...context, appName: env?.APP_NAME, year: env?.YEAR },
//   };

//   console.table(mailOptions);

//   tranporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       callback(error, null);
//     } else {
//       callback(null, info);
//     }
//   });
// };

let resend: any = null;

function getResendObject() {
  if (resend) return resend;
  return new Resend(env.EMAIL_PASSWORD);
}

export const sendEmail = async (
  { receiverEmail, emailTemplate, context, subject }: EmailProps,
  callback: Function,
) => {
  const email_from = env.EMAIL_FROM;

  const html = await compileHbs(emailTemplate, {
    ...context,
    appName: env.APP_NAME,
    year: env.YEAR,
  });

  const { data, error } = await getResendObject().emails.send({
    from: email_from,
    to: receiverEmail,
    subject,
    html,
  });

  if (error) {
    callback(error);
  }

  callback(null, data);
};

export default { sendEmail };
