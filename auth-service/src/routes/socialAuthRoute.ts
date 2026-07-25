import { Router } from 'express';
import socialAuth from '../controller/socialAuthController';
const socialAuthRoute = Router();

socialAuthRoute.post('/public/google', socialAuth.googleAuth);

export default socialAuthRoute;
