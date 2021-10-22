import { Types } from 'mongoose';
import { verify } from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-hapi';
import { UserModel, userSchema } from '../schemas/User';

const JWT_SECRET_KEY = 'secret';

export const applyAuthorizationContext = async (token: string) => {
  const payload = <{ sub: string }>verify(token, JWT_SECRET_KEY);
  const filter = { _id: new Types.ObjectId(payload?.sub) };
  const user = await UserModel.findOne(filter);

  console.log(`User: ${user.firstName}`);

  if (user) return {
    user: user,
  }

  throw new AuthenticationError('Invalid user');
}