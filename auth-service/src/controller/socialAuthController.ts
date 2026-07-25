import { Request, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import { OAuth2Client } from 'google-auth-library';
import logger from '../config/winston';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = tryCatchErrorHandler(
  async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;

      // Verify Google Token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      // Find or Create User
      //   let user = await User.findOne({ googleId: payload.sub });

      //   if (!user) {
      //     user = await User.create({
      //       googleId: payload.sub,
      //       email: payload.email,
      //       name: payload.name,
      //       picture: payload.picture,
      //       authProvider: 'google',
      //       emailVerified: payload.email_verified,
      //     });
      //   }

      // Generate your JWT
      //   const token = jwt.sign(
      //     { userId: user._id, email: user.email },
      //     process.env.JWT_SECRET,
      //     { expiresIn: '7d' },
      //   );

      res.json(payload);
      return;
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Invalid Google token' });
    }
  },
);

export default { googleAuth };
