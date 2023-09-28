import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import {
  getOneUser,
  getUserById,
  getUsers,
  updateUser,
} from './user.repository';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';
import { UpdateUserDto } from './dto/updateUserDto';
import { validateUpdateUser } from './schema/updateUser.schema';
import { User } from '@prisma/client';
import { verifyPassword } from '../../utils/encryption';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { FindUsersResponseDto } from './dto/findUsers.response.dto';
import { validateGetUsers } from './schema/getUsers.schema';

@Injectable()
export class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await getUserById(id);
    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }

  async getUsers(query: FindUsersQueryDto): Promise<FindUsersResponseDto> {
    validateGetUsers(query);

    return await getUsers(query);
  }

  async editUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    validateUpdateUser(updateUserDto);

    const userExists = await getOneUser({ id: user.id }, ['id', 'password']);
    if (!userExists) throw new NotFoundException('User Not Found');

    const passwordMatch = await verifyPassword(
      updateUserDto.password,
      userExists.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    if (
      updateUserDto.cpf &&
      removeNonNumbersCharacters(updateUserDto.cpf) != user.cpf
    ) {
      const cpfExists = await getOneUser(
        { cpf: removeNonNumbersCharacters(updateUserDto.cpf) },
        ['id', 'cpf'],
      );
      if (cpfExists) throw new ConflictException('CPF Already Exists');
    }

    return await updateUser(user, updateUserDto);
  }
}
