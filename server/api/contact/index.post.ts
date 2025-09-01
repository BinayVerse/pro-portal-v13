import axios from 'axios';
import type { EventHandlerRequest, H3Event } from 'h3';
import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { CustomError } from '../../utils/custom.error';
import { ContactUsValidation } from '../../utils/validations';
import { query } from '../../utils/db';
import { sendMeetingRequestMail } from '../helper';

const config = useRuntimeConfig();
const secretkey = config.googleCaptchaSecretKey;

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const params = await readBody(event);

  const validate = ContactUsValidation.safeParse(params);
  if (!validate.success) {
    throw new CustomError(`Invalid input provided: ${validate.error.errors.map(e => e.message).join(', ')}`, 400);
  }

  // Skip reCAPTCHA verification for demo token
  if (validate.data.token !== 'demo-token') {
    const recaptchaRes = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretkey,
          response: validate.data.token,
        },
      }
    );

    if (!recaptchaRes.data.success) {
      throw new CustomError('reCAPTCHA verification failed', 400);
    }
  }

  try {
    console.log('Processing contact request - Phone number:', validate.data.phone);

    // Save in DB
    await query(
      `INSERT INTO contacts (name, lastname, email, phone, request_for, message, company, job_title, company_size)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        validate.data.name,
        validate.data.lastname || '',
        validate.data.email,
        validate.data.phone || null,
        validate.data.requestFor || null,
        validate.data.message || null,
        validate.data.company || null,
        validate.data.jobTitle || null,
        validate.data.companySize || null
      ]
    );

    // Try to send email, but don't fail the request if email fails
    try {
      await sendMeetingRequestMail({
        name: validate.data.name,
        lastname: validate.data.lastname || '',
        email: validate.data.email,
        phone: validate.data.phone || '',
        requestFor: validate.data.requestFor || '',
        message: validate.data.message || '',
        company: validate.data.company || '',
        jobTitle: validate.data.jobTitle || '',
        companySize: validate.data.companySize || '',
        domain: validate.data.domain || 'unknown',
      });
    } catch (emailError) {
      console.warn('Email sending failed, but contact was saved:', emailError);
    }

    setResponseStatus(event, 201);
    return {
      statusCode: 201,
      status: 'success',
      message: 'We have received your request. We will get back to you soon!',
    };
  } catch (error) {
    if (error instanceof CustomError) {
      setResponseStatus(event, error.statusCode);
      return {
        statusCode: error.statusCode,
        status: 'error',
        message: error.message,
      };
    }
    throw new CustomError(`Failed to process request: ${error}`, 400);
  }
});
