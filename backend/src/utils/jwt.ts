import { UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

export const generateJwt = (
  secret: string,
  payload: object,
  expiresIn: string,
) => {
  return sign(payload, secret, {
    expiresIn,
  });
};

export const verifyJwt = (secret: string, token: string) => {
  try {
    return verify(token, secret);
  } catch (error) {
    throw new UnauthorizedException('Invalid Refresh Token');
  }
};
