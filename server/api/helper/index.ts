import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { query } from '../../utils/db';
import { getCompanySizeLabel, getRequestForLabel } from '../../utils/display-mappings';

export const sendWelcomeMail = async (name: string, email: string, password: string, portalLink: string, resetLink?: string) => {
  try {
    const config = useRuntimeConfig();
    sgMail.setApiKey(config.sendgridApiKey as string);

    const resetPasswordSection = resetLink
      ? `
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
          You can reset your password by clicking the link below:
        </p>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; text-align: center;">
          <a href="${resetLink}" style="color: #13dcff; text-decoration: none; font-weight: bold;">Reset Password</a>
        </p>
      `
      : '';

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to provento.ai</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border-radius: 10px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 20px 0; background-color: #13dcff; color: #ffffff; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to provento.ai! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                We're thrilled to have you on board. With provento.ai, you can chat with your documents like never before—extracting insights, finding answers, and streamlining workflows effortlessly.
              </p>
              <h3 style="font-size: 18px; margin: 20px 0 10px;">Here's how to get started:</h3>
              <p style="line-height: 1.5; margin: 0 0 20px;">
                <div style="font-size: 16px;">📁  Upload a Document:</div>
                <div style="font-size: 15px;">Log in to your admin portal and drag and drop the documents you want your users to interact with.</div>
              </p>
              <p style="line-height: 1.5; margin: 0 0 20px;">
                <div style="font-size: 16px;">👥  Onboard WhatsApp Users:</div>
                <div style="font-size: 15px;">Invite users by entering their WhatsApp number and Email ID.
                <br />
                They’ll receive an email with a QR Code to start chatting with documents on WhatsApp.</div>
              </p>
              <p style="line-height: 1.5; margin: 0 0 20px;">
                <div style="font-size: 16px;">💬  Start Chatting on Slack (New!):</div>
                <div style="font-size: 15px;">Once you connect your Slack workspace:
                <br />
                All users in the workspace will automatically be able to chat with your uploaded documents.
                <br />
                They simply need to open the bot in Slack and start asking questions.</div>
              </p>
              <p style="line-height: 1.5; margin: 0 0 20px;">
                <div style="font-size: 16px;">🏢  Chat on Microsoft Teams:</div>
                <div style="font-size: 15px;">Once your Teams workspace is connected,
                <br />
                All users can instantly start chatting with your uploaded documents —
                just open the bot in Teams and ask questions!</div>
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                Please access our app <a href="${portalLink}" style="color: #13dcff; text-decoration: none;">here</a> with your credentials.
              </p>
              ${resetPasswordSection}
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">Let's transform the way you work with documents! 🚀</p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">Cheers,</p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0;"><strong>The provento.ai Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 20px; background-color: #f1f1f1; border-radius: 0 0 10px 10px;">
              <p style="font-size: 14px; color: #777; margin: 0;">
                © 2025 provento.ai. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: config.sendgridFromEmailId as string,
      subject: 'Welcome to provento.ai',
      text: `Welcome to provento.ai! We're thrilled to have you on board.`,
      html: htmlBody,
    };

    await sgMail.send(msg);
    console.log('Signup email sent successfully');
  } catch (error: any) {
    console.error('Error sending signup email:', error.response?.body || error.message);
    throw new Error(`Failed to send signup email: ${error.response?.body?.errors[0]?.message || error.message}`);
  }
};

export const sendResetPasswordMail = async (name: string, email: string, resetLink: string) => {
  try {
    const config = useRuntimeConfig();
    sgMail.setApiKey(config.sendgridApiKey as string);

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border-radius: 10px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);">
        <tr>
          <td align="center" style="padding: 20px 0; background-color: #13dcff; color: #ffffff; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
              We received a request to reset your password. To proceed, please click the link below:
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
              <a href="${resetLink}" style="color: #13dcff; text-decoration: none; font-weight: bold;">Reset Password</a>
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
              If you did not request this, please ignore this email. Your password will not be changed.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0;">Cheers,</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0;"><strong>The provento.ai Team</strong></p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 20px; background-color: #f1f1f1; border-radius: 0 0 10px 10px;">
            <p style="font-size: 14px; color: #777; margin: 0;">
              © 2025 provento.ai. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    const msg = {
      to: email,
      from: config.sendgridFromEmailId as string,
      subject: 'Password Reset Request',
      text: `We received a request to reset your password. If you did not request this, please ignore this email.`,
      html: htmlBody,
    };

    await sgMail.send(msg);
  } catch (error: any) {
    throw new Error(`Failed to send reset password email: ${error.response?.body?.errors[0]?.message || error.message}`);
  }
};

export const sendPasswordUpdatedMail = async (name: string, email: string) => {
  try {
    const config = useRuntimeConfig();
    sgMail.setApiKey(config.sendgridApiKey as string);

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Successfully Updated</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border-radius: 10px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);">
        <tr>
          <td align="center" style="padding: 20px 0; background-color: #13dcff; color: #ffffff; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Your Password Has Been Updated</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
              Your password has been successfully updated. If you did not initiate this change, please contact us immediately.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
              For your security, we recommend logging in to your account to confirm the changes and update any necessary settings.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">
              If you have any concerns or need assistance, feel free to reach out to us at any time.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0 0 10px;">Cheers,</p>
            <p style="font-size: 16px; line-height: 1.5; margin: 0;"><strong>The provento.ai Team</strong></p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 20px; background-color: #f1f1f1; border-radius: 0 0 10px 10px;">
            <p style="font-size: 14px; color: #777; margin: 0;">
              © 2025 provento.ai. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    const msg = {
      to: email,
      from: config.sendgridFromEmailId as string,
      subject: 'Your Password Has Been Updated',
      text: `Your password has been successfully updated. If you did not initiate this change, please contact us immediately.`,
      html: htmlBody,
    };

    await sgMail.send(msg);
  } catch (error: any) {
    throw new Error(`Failed to send password updated email: ${error.response?.body?.errors[0]?.message || error.message}`);
  }
};

function generateRandomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const sendUserAdditionMail = async (name: string, email: string, qrCode: string) => {
  try {
    const randomStr = generateRandomString();
    const config = useRuntimeConfig();
    sgMail.setApiKey(config.sendgridApiKey as string);

    const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation to Access provento.ai</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #13dcff;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .content p {
          margin: 10px 0;
          font-size: 16px;
          line-height: 1.5;
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-code img {
          max-width: 200px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .steps {
          margin: 20px 0;
          padding-left: 20px;
        }
        .steps li {
          margin: 10px 0;
        }
        .footer {
          background-color: #f1f1f1;
          color: #777;
          text-align: center;
          padding: 10px 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invitation to Access provento.ai</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We are excited to introduce the Document Chatting WhatsApp Bot <strong>“provento.ai”</strong>! With this tool, managing and accessing organization documents and information has never been easier. You can now chat with documents via WhatsApp to instantly find answers and get support.</p>
          <h3>Steps to Access the WhatsApp Bot:</h3>
          <ol class="steps">
            <li>Open WhatsApp on your smartphone.</li>
            <li>Go to Settings (iPhone: bottom-right, Android: tap the three-dot menu in the top-right → Settings).</li>
            <li>Tap the QR code icon next to your name.</li>
            <li>Tap <strong>Scan Code</strong> and scan the QR code from this email.</li>
            <li>WhatsApp will automatically open the bot conversation.</li>
          </ol>
          <div class="qr-code">
            <img id="${randomStr}" src="${qrCode}" alt="QR Code">
          </div>
          <p>Once you’ve scanned the code, you’ll be connected to our bot and ready to explore all the features we’ve built just for you!</p>
          <h3>Features of provento.ai:</h3>
          <ul class="steps">
            <li>Chat with organization documents quickly by asking the bot.</li>
            <li>Find quick answers to questions related to your organization documents.</li>
            <li>This bot will simplify your organization interactions and make document chatting seamless.</li>
          </ul>
          <p>We’re excited to have you try it out and hope it makes your experience smoother!</p>
          <p>Best regards,</p>
          <p><strong>The provento.ai Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 provento.ai. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const msg = {
      to: email,
      from: config.sendgridFromEmailId as string,
      subject: 'Invitation to Access provento.ai',
      text: `Invitation to Access provento.ai! We're thrilled to have you on board.`,
      html: htmlBody,
    };

    await sgMail.send(msg);
    console.log('User addition email sent successfully');
  } catch (error: any) {
    console.error('Error sending User addition email:', error.response?.body || error.message);
    throw new Error(
      `Failed to send User addition email: ${error.response?.body?.errors?.[0]?.message || error.message}`
    );
  }
};

export const sendMeetingRequestMail = async ({
  name,
  lastname,
  email,
  phone,
  requestFor,
  message,
  company,
  jobTitle,
  companySize,
  domain
}: {
  name: string
  lastname: string
  email: string
  phone: string
  requestFor: string
  message: string
  company: string
  jobTitle: string
  companySize: string
  domain: string
}) => {
  try {
    const config = useRuntimeConfig();

    // Check if email configuration is available
    if (!config.sendgridApiKey || !config.sendgridFromEmailId || !config.sendgridSalesTeamEmails) {
      console.warn('Email configuration missing. Contact form data received but email not sent:', {
        name, lastname, email, company, requestFor
      });
      return; // Exit gracefully without sending email
    }

    sgMail.setApiKey(config.sendgridApiKey as string);
    const headerMessage = domain === 'Prod'
      ? 'We have received a new <strong>Demo Request</strong> via the website.'
      : `We have received a new <strong>Demo Request</strong> request via the <strong>${domain}</strong> website.`;

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Book Meeting Request</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin: 20px auto; border-radius: 10px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 20px 0; background-color: #13dcff; color: #ffffff; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0;">Demo Request</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <p style="font-size: 16px; line-height: 1.5;">Dear Sales Team,</p>
              <p style="font-size: 16px; line-height: 1.5;">
                ${headerMessage}
              </p>

              <h3 style="font-size: 18px; margin-top: 20px;">Contact Details:</h3>
              <table width="100%" style="font-size: 15px; margin: 15px 0; border-collapse: collapse;">
                <tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Full Name:</strong></td><td style="padding: 5px 0;">${name} ${lastname}</td></tr>
                <tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Email:</strong></td><td style="padding: 5px 0;">${email}</td></tr>
                ${phone ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Phone Number:</strong></td><td style="padding: 5px 0;">${phone}</td></tr>` : ''}
                ${company ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Company:</strong></td><td style="padding: 5px 0;">${company}</td></tr>` : ''}
                ${jobTitle ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Job Title:</strong></td><td style="padding: 5px 0;">${jobTitle}</td></tr>` : ''}
                ${companySize ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Company Size:</strong></td><td style="padding: 5px 0;">${getCompanySizeLabel(companySize)}</td></tr>` : ''}
                ${requestFor ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Request For:</strong></td><td style="padding: 5px 0;">${getRequestForLabel(requestFor)}</td></tr>` : ''}
                ${message ? `<tr><td style="padding: 5px 10px 5px 0; vertical-align: top;"><strong>Message:</strong></td><td style="padding: 5px 0;">${message}</td></tr>` : ''}
              </table>

              <p style="font-size: 16px; line-height: 1.5;">
                Please follow up with this user to schedule the demo session at your earliest convenience.
              </p>

              <p style="font-size: 16px; line-height: 1.5;">Thanks & Regards,<br><strong>provento.ai Team</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 20px; background-color: #f1f1f1; border-radius: 0 0 10px 10px;">
              <p style="font-size: 14px; color: #777; margin: 0;">© 2025 provento.ai. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const salesTeamEmails = (config.sendgridSalesTeamEmails as string).split(',').map(email => email.trim());

    const msg = {
      to: salesTeamEmails,
      from: config.sendgridFromEmailId as string,
      subject: `Demo Request - ${name} ${lastname}${company ? ` from ${company}` : ''}`,
      text: `New demo request from ${name} ${lastname}${company ? ` (${company})` : ''} regarding ${requestFor || 'general inquiry'}. Email: ${email}${phone ? `, Phone: ${phone}` : ''}`,
      html: htmlBody,
    };

    await sgMail.send(msg);
    console.log('Book meeting request email sent successfully');
  } catch (error: any) {
    console.error('Error sending meeting request email:', error.response?.body || error.message);
    throw new Error(`Failed to send meeting request email: ${error.response?.body?.errors?.[0]?.message || error.message}`);
  }
};


export function generateRandomPassword() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const passwordLength = Math.floor(Math.random() * 3) + 6; // Generate a length between 6 and 8
  let password = '';
  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

export const generateResetLink = async (
  email: string,
  appUrl: string
): Promise<{ resetLink: string }> => {
  try {
    // Generate the reset token and expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Check if user exists
    const userCheck = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (!userCheck.rows.length) {
      throw new Error(`No user found with email: ${email}`);
    }

    // Update the reset token and expiry in DB
    const result = await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 RETURNING user_id;',
      [token, expiry, email]
    );

    // console.log('Updated user:', result.rows[0]);

    // Generate the reset link
    const resetLink = `${appUrl}/update-password?token=${encodeURIComponent(token)}`;
    return { resetLink };

  } catch (err) {
    console.error('Error generating reset link:', err);
    throw err;
  }
};
