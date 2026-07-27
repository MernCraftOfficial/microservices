import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller';
const emailRoute = Router();

emailRoute.post('/send', sendEmail);

export default emailRoute;
