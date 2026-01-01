import { Router } from 'express';
import { sendEmail } from '../controller/emailController';
const emailRoute = Router();

emailRoute.post('/send', sendEmail);

export default emailRoute;
