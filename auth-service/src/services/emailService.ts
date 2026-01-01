import { fetchHelper, fetchProps, Response } from '../helper/fetchHelper';
interface EmailProps {
  receiverEmail: string;
  emailTemplate: string;
  subject: string;
  context: Record<string, any>;
}
export async function sendEmail({
  receiverEmail,
  emailTemplate,
  subject,
  context,
}: EmailProps) {
  emailTemplate = 'auth-service/' + emailTemplate;
  const body = { receiverEmail, emailTemplate, subject, context };
  const params: { path: string; options: fetchProps } = {
    path: `/email/send`,
    options: {
      method: 'POST',
      body: body,
    },
  };

  const response: Response = await fetchHelper(params);
  return response;
}

export default { sendEmail };
