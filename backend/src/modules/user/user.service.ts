import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { getOneUser, getUsers, updateUser } from './user.repository';
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
    const user = await getOneUser({ id, active: true }, [
      'id',
      'active',
      'name',
      'cpf',
      'phone',
      'email',
      'createdAt',
      'updatedAt',
    ]);
    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }

  async getUsers(query: FindUsersQueryDto): Promise<FindUsersResponseDto> {
    validateGetUsers(query);

    return await getUsers(query);
  }

  async editUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    validateUpdateUser(updateUserDto);

    const { cpf, name, password, phone } = updateUserDto;
    const user = await getOneUser({ id: userId }, [
      'id',
      'name',
      'cpf',
      'phone',
      'email',
      'password',
    ]);
    if (!user) throw new NotFoundException('User Not Found');

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    if (cpf && removeNonNumbersCharacters(cpf) != user.cpf) {
      const cpfExists = await getOneUser(
        { cpf: removeNonNumbersCharacters(cpf) },
        ['id', 'cpf'],
      );
      if (cpfExists) throw new ConflictException('CPF Already Exists');
    }

    return await updateUser(user.id, {
      name: name ? name : user.name,
      cpf: cpf ? removeNonNumbersCharacters(cpf) : user.cpf,
      phone: phone ? removeNonNumbersCharacters(phone) : user.phone,
    });
  }
}
