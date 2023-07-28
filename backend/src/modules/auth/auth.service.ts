import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { validateCreateUser } from './schemas/createUser.schema';
import { createUser } from '../user/user.repository';

@Injectable()
export class AuthService {
  async createUser(createUserDto: CreateUserDto) {
    validateCreateUser(createUserDto);
    const { password, passwordConfirmation } = createUserDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');
    return await createUser(createUserDto);
  }
}
