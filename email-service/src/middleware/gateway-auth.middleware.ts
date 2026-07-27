import { NextFunction, Request, Response } from 'express';
import { verifySignature } from '../helpers/crypto.helper';
import { JwtRequest, UserPayload } from '../types/common.type';
import env from '../config/env';
import { requestContext } from '../libs/request-context.lib';

export default function gatewayAuth(
  req: JwtRequest,
  res: Response,
  next: NextFunction,
) {
  const payload = req.headers['x-user'];
  const signature = req.headers['x-user-signature'];

  if (!payload || !signature) {
    return res.status(401).json({ message: 'Missing gateway headers' });
  }

  const isValid = verifySignature(
    payload as string,
    signature as string,
    env.GATEWAY_SECRET!,
  );

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid gateway signature' });
  }

  try {
    req.user = JSON.parse(payload as string) as UserPayload;

    requestContext.run(
      {
        'x-user': payload as string,
        'x-user-signature': signature as string,
      },
      next,
    );

    // next();
  } catch {
    return res.status(400).json({ message: 'Invalid user payload' });
  }
}
