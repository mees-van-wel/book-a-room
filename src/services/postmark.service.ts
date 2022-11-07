import { Attachment, Client } from 'postmark';

const client = new Client('06b3c739-feda-4ed0-8c48-7d46e041f089');

interface SendMailProps {
  to: string;
  title: string;
  body: string;
  attachments?: Attachment[];
}

export const sendMail = async ({ to, title, body, attachments }: SendMailProps) => {
  await client
    .sendEmail({
      From: 'Hexa Center <noreply@hexa.center>',
      To: to,
      Subject: title,
      HtmlBody: body,
      Attachments: attachments,
    })
    .catch((error) => {
      console.log(error);
    });
};
