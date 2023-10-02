import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { validateCreateUser } from './schemas/createUser.schema';
import {
  createUser,
  deleteUser,
  getOneUser,
  updateUser,
} from '../user/user.repository';
import { CredentialsDto } from './dto/credentials.dto';
import { validateSignIn } from './schemas/credentials.schema';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { encryptPassword, verifyPassword } from '../../utils/encryption';
import { generateJwt } from '../../utils/jwt';
import envConfig from '../../config/env.config';
import { RefreshTokenService } from '../refreshToken/refreshToken.service';
import { SignInResponseDto } from './dto/signIn.response.dto';
import { User } from '@prisma/client';
import { MessageResponseDto } from '../../shared/dto/message.response.dto';
import slugify from 'slugify';
import { generateRandomCode } from '../../utils/generateRandomCode';
import { validateCPF } from '../../utils/validate-cpf';
import { DeactivateAccountDto } from './dto/deactivateAccount.dto';
import { validateDeactivateAccount } from './schemas/deactivateAccount.schema';
import { DeleteAccountDto } from './dto/deleteAccount.dto';
import { validateDeleteAccount } from './schemas/deleteAccount.schema';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(private refreshTokenService: RefreshTokenService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    validateCreateUser(createUserDto);

    const slug = slugify(createUserDto.name, {
      lower: true,
      trim: true,
      replacement: '-',
    });
    let userSlug = `${generateRandomCode()}-${slug}`;

    const { password, passwordConfirmation } = createUserDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    validateCPF(removeNonNumbersCharacters(createUserDto.cpf));

    const userExists = await getOneUser({
      OR: [
        { active: true, cpf: removeNonNumbersCharacters(createUserDto.cpf) },
        { active: true, email: createUserDto.email },
      ],
    });
    if (userExists) throw new ConflictException('User Already Exists');

    let userSlugExists = true;
    while (userSlugExists) {
      const user = await getOneUser({
        slug: userSlug,
      });
      if (!user) userSlugExists = false;
      else userSlug = `${generateRandomCode()}-${slug}`;
    }

    return await createUser({
      ...createUserDto,
      slug: userSlug,
      password: await encryptPassword(createUserDto.password),
    });
  }

  async signIn(credentialsDto: CredentialsDto): Promise<SignInResponseDto> {
    validateSignIn(credentialsDto);

    const { email, password } = credentialsDto;
    const user = await getOneUser({ email }, [
      'id',
      'password',
      'active',
      'updatedAt',
    ]);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    if (!user.active) {
      const today = dayjs(new Date());
      const userUpdatedAt = dayjs(user.updatedAt);
      const diff = today.diff(userUpdatedAt, 'days');
      if (diff < 30) await updateUser(user.id, { active: true });
      else
        throw new ForbiddenException(
          'Account deactivated for more than 30 days. Please, sign up as a new user',
        );
    }

    return {
      accessToken: generateJwt(
        envConfig.jwt.accessSecret,
        { id: user.id },
        envConfig.jwt.accessExpirationMinutes,
      ),
      refreshToken: await this.refreshTokenService.createRefreshToken(user.id),
    };
  }

  async deactivateAccount(
    userId: string,
    deactivateAccountDto: DeactivateAccountDto,
  ): Promise<MessageResponseDto> {
    validateDeactivateAccount(deactivateAccountDto);

    const user = await getOneUser({ id: userId, active: true }, [
      'id',
      'password',
    ]);
    if (!user) throw new NotFoundException('User not found');

    const { password, passwordConfirmation } = deactivateAccountDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const passwordMatch = await verifyPassword(password, user.password);
    const passwordConfirmationMatch = await verifyPassword(
      passwordConfirmation,
      user.password,
    );
    if (!passwordMatch || !passwordConfirmationMatch)
      throw new UnauthorizedException('Invalid Credentials');

    await updateUser(user.id, { active: false });
    return {
      message: 'Account deactivated Successfully',
    };
  }

  async deleteAccount(
    userId: string,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<MessageResponseDto> {
    validateDeleteAccount(deleteAccountDto);

    const { email, password, passwordConfirmation } = deleteAccountDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const user = await getOneUser({ id: userId, email, active: true }, [
      'id',
      'password',
    ]);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await verifyPassword(password, user.password);
    const passwordConfirmationMatch = await verifyPassword(
      passwordConfirmation,
      user.password,
    );
    if (!passwordMatch || !passwordConfirmationMatch)
      throw new UnauthorizedException('Invalid Credentials');

    await deleteUser(user.id);
    return {
      message: 'Account and all data related deleted successfully',
    };
  }
}
