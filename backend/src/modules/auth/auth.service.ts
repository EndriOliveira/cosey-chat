import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { validateCreateUser } from './schemas/createUser.schema';
import { createUser, getOneUser } from '../user/user.repository';
import { CredentialsDto } from './dto/credentials.dto';
import { validateSignIn } from './schemas/credentials.schema';
import { removeNonNumbersCharacters } from '../../utils/removeNonNumbersCharacters';
import { encryptPassword, verifyPassword } from '../../utils/encryption';
import { generateJwt } from '../../utils/jwt';
import envConfig from '../../config/env.config';
import { RefreshTokenService } from '../refreshToken/refreshToken.service';
import { SignInResponseDto } from './dto/signIn.response.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private refreshTokenService: RefreshTokenService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    validateCreateUser(createUserDto);

    const { password, passwordConfirmation } = createUserDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const userExists = await getOneUser({
      OR: [
        { active: true, cpf: removeNonNumbersCharacters(createUserDto.cpf) },
        { active: true, email: createUserDto.email },
      ],
    });
    if (userExists) throw new ConflictException('User Already Exists');

    return await createUser({
      ...createUserDto,
      password: await encryptPassword(createUserDto.password),
    });
  }

  async signIn(credentialsDto: CredentialsDto): Promise<SignInResponseDto> {
    validateSignIn(credentialsDto);

    const { email, password } = credentialsDto;
    const user = await getOneUser({ email, active: true }, ['id', 'password']);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    return {
      accessToken: generateJwt(
        envConfig.jwt.accessSecret,
        { id: user.id },
        envConfig.jwt.accessExpirationMinutes,
      ),
      refreshToken: await this.refreshTokenService.createRefreshToken(user.id),
    };
  }
}
