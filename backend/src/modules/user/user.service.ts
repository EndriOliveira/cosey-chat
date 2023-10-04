import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import slugify from 'slugify';
import { verifyPassword } from '../../utils/encryption';
import { generateRandomCode } from '../../utils/generateRandomCode';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { FindUsersResponseDto } from './dto/findUsers.response.dto';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';
import { UpdateUserDto } from './dto/updateUserDto';
import { validateGetUsers } from './schema/getUsers.schema';
import { validateUpdateUser } from './schema/updateUser.schema';
import { getOneUser, getUsers, updateUser } from './user.repository';
import { validateCPF } from '../../utils/validate-cpf';

@Injectable()
export class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await getOneUser({ id, active: true });
    if (!user) throw new NotFoundException('User Not Found');

    delete user.password;
    return user;
  }

  async getUserBySlug(slug: string): Promise<User> {
    const user = await getOneUser({ slug, active: true });
    if (!user) throw new NotFoundException('User Not Found');

    delete user.password;
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
      'slug',
      'password',
    ]);
    if (!user) throw new NotFoundException('User Not Found');

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    if (cpf && removeNonNumbersCharacters(cpf) != user.cpf) {
      validateCPF(removeNonNumbersCharacters(cpf));

      const cpfExists = await getOneUser(
        { cpf: removeNonNumbersCharacters(cpf) },
        ['id', 'cpf'],
      );
      if (cpfExists) throw new ConflictException('CPF Already Exists');
    }

    let userSlug;
    if (name) {
      const slug = slugify(name, {
        lower: true,
        trim: true,
        replacement: '-',
      });
      userSlug = `${generateRandomCode({
        length: 6,
        lowerCaseLetters: true,
        numbers: true,
      })}-${slug}`;
      let userSlugExists = true;
      while (userSlugExists) {
        const user = await getOneUser({
          slug: userSlug,
        });
        if (!user) userSlugExists = false;
        else
          userSlug = `${generateRandomCode({
            length: 6,
            lowerCaseLetters: true,
            numbers: true,
          })}-${slug}`;
      }
    }

    return await updateUser(user.id, {
      name: name ? name : user.name,
      cpf: cpf ? removeNonNumbersCharacters(cpf) : user.cpf,
      phone: phone ? removeNonNumbersCharacters(phone) : user.phone,
      slug: name && userSlug ? userSlug : user.slug,
    });
  }
}
