import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { validateCreateUser } from './schemas/createUser.schema';
import { createUser, signIn } from '../user/user.repository';
import { CredentialsDto } from './dto/credentials.dto';
import { validateSignin } from './schemas/credentials.schema';

@Injectable()
export class AuthService {
  async createUser(createUserDto: CreateUserDto) {
    validateCreateUser(createUserDto);
    const { password, passwordConfirmation } = createUserDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');
    return await createUser(createUserDto);
  }

  async signIn(credentialsDto: CredentialsDto) {
    validateSignin(credentialsDto);
    return await signIn(credentialsDto);
  }
}
