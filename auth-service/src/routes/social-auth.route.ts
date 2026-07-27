import { Router } from 'express';
import socialAuth from '../controllers/social-auth.controller';
const socialAuthRoute = Router();

socialAuthRoute.post('/public/google', socialAuth.googleAuth);

export default socialAuthRoute;
