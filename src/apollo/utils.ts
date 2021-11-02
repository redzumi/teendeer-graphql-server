import { Types } from 'mongoose';
import { verify } from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-hapi';
import { UserModel } from '../schemas/User';

import { JWT_SECRET_KEY } from './constants';

export const applyAuthorizationContext = async (token: string) => {
  const payload = <{ sub: string }>verify(token, JWT_SECRET_KEY);
  const filter = { _id: new Types.ObjectId(payload?.sub) };
  const user = await UserModel.findOne(filter);

  if (user) return {
    user: user,
  }

  throw new AuthenticationError('Invalid user');
}