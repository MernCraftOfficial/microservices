import nodemailer, { SendMailOptions } from 'nodemailer';
import env from './env';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

interface EmailProps {
  receiverEmail: string;
  emailTemplate: string;
  subject: string;
  context: Record<string, any>;
}

export interface HbsMailOptions extends SendMailOptions {
  template?: string;
  context?: Record<string, any>;
}

export const sendEmail = (
  { receiverEmail, emailTemplate, context, subject }: EmailProps,
  callback: Function,
) => {
  const sender = env.GMAIL_USER;
  const password = env.GMAIL_PASSWORD;
  const tranporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: sender,
      pass: password,
    },
  });

  // handlebar middleware for templates
  const templatesDir = path.join(__dirname, '..', 'templates');

  tranporter.use(
    'compile',
    hbs({
      viewEngine: {
        extname: '.hbs',
        layoutsDir: templatesDir,
        partialsDir: path.join(templatesDir, 'partials'),
        defaultLayout: false,
      },
      viewPath: templatesDir,
      extName: '.hbs',
    }),
  );

  const mailOptions: HbsMailOptions = {
    from: sender,
    to: receiverEmail,
    subject: subject,
    template: emailTemplate,
    context: { ...context, appName: env?.APP_NAME, year: env?.YEAR },
  };

  tranporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, info);
    }
  });
};

export default { sendEmail };
