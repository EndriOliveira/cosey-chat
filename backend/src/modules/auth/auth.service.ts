import {
  BadRequestException,
  ConflictException,
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
import { SendDeleteAccountEmailDto } from './dto/sendDeleteAccountEmail.dto';
import { validateSendDeleteAccountEmail } from './schemas/sendDeleteAccountEmail.schema';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { validateForgotPassword } from './schemas/forgotPassword.schema';
import { SendGridService } from '../sendGrid/sendGrid.service';
import { forgotPasswordTemplate } from '../../templates/forgotPassword.template';
import { CodeService } from '../code/code.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { validateResetPassword } from './schemas/resetPassword.schema';
import { newUserTemplate } from '../../templates/newUser.template';
import { deleteAccountCodeTemplate } from '../../templates/deleteAccountCode.template';
import { DeleteAccountDto } from './dto/deleteAccount.dto';
import { validateDeleteAccount } from './schemas/deleteAccount.schema';
import { deleteAccountSuccessTemplate } from '../../templates/deleteAccountSuccess.template';
import { deactivateAccountTemplate } from '../../templates/deactivateAccount.template';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { validateChangePassword } from './schemas/changePassword.schema';

@Injectable()
export class AuthService {
  constructor(
    private refreshTokenService: RefreshTokenService,
    private codeService: CodeService,
    private sendGridService: SendGridService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    validateCreateUser(createUserDto);

    const slug = slugify(createUserDto.name, {
      lower: true,
      trim: true,
      replacement: '-',
    });
    let userSlug = `${generateRandomCode({
      length: 6,
      lowerCaseLetters: true,
      numbers: true,
    })}-${slug}`;

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
      else
        userSlug = `${generateRandomCode({
          length: 6,
          lowerCaseLetters: true,
          numbers: true,
        })}-${slug}`;
    }

    const user = await createUser({
      ...createUserDto,
      slug: userSlug,
      password: await encryptPassword(createUserDto.password),
    });

    const mail = newUserTemplate({
      email: user.email,
      name: user.name.split(' ')[0],
    });
    await this.sendGridService.sendMail(mail);

    return user;
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

    if (!user.active) await updateUser(user.id, { active: true });

    return {
      accessToken: generateJwt(
        envConfig.jwt.accessSecret,
        { id: user.id },
        envConfig.jwt.accessExpirationTime,
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
      'email',
      'name',
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
    const mail = deactivateAccountTemplate({
      email: user.email,
      name: user.name.split(' ')[0],
    });
    await this.sendGridService.sendMail(mail);
    return {
      message: 'Account deactivated successfully',
    };
  }

  async sendDeleteAccountEmail(
    userId: string,
    sendDeleteAccountEmailDto: SendDeleteAccountEmailDto,
  ): Promise<MessageResponseDto> {
    validateSendDeleteAccountEmail(sendDeleteAccountEmailDto);

    const { email, password, passwordConfirmation } = sendDeleteAccountEmailDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const user = await getOneUser({ id: userId, email, active: true }, [
      'id',
      'password',
      'email',
      'name',
    ]);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await verifyPassword(password, user.password);
    const passwordConfirmationMatch = await verifyPassword(
      passwordConfirmation,
      user.password,
    );
    if (!passwordMatch || !passwordConfirmationMatch)
      throw new UnauthorizedException('Invalid Credentials');

    const code = await this.codeService.createCode(user.id);

    const mail = deleteAccountCodeTemplate({
      email: user.email,
      code: code,
      name: user.name.split(' ')[0],
    });
    await this.sendGridService.sendMail(mail);
    return {
      message: 'Please verify your email for further information',
    };
  }

  async deleteAccount(
    userId: string,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<MessageResponseDto> {
    validateDeleteAccount(deleteAccountDto);

    const { code } = deleteAccountDto;
    await this.codeService.validateCode(code);

    const user = await getOneUser({ id: userId, active: true }, [
      'id',
      'email',
      'name',
    ]);
    if (!user) throw new NotFoundException('User not found');

    await deleteUser(userId);

    const mail = deleteAccountSuccessTemplate({
      email: user.email,
      name: user.name.split(' ')[0],
    });
    await this.sendGridService.sendMail(mail);
    return {
      message: 'Account and all data related deleted successfully',
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    validateForgotPassword(forgotPasswordDto);

    const { email } = forgotPasswordDto;
    const user = await getOneUser({ email, active: true }, [
      'id',
      'email',
      'name',
    ]);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const code = await this.codeService.createCode(user.id);

    const mail = forgotPasswordTemplate({
      email: user.email,
      code: code,
      name: user.name.split(' ')[0],
    });
    await this.sendGridService.sendMail(mail);
    return {
      message: 'Please verify your email for further information',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    validateResetPassword(resetPasswordDto);

    const { code, password, passwordConfirmation } = resetPasswordDto;
    if (password !== passwordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const userCode = await this.codeService.validateCode(code);
    await updateUser(userCode.userId, {
      password: await encryptPassword(password),
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    validateChangePassword(changePasswordDto);

    const { password, newPassword, newPasswordConfirmation } =
      changePasswordDto;

    if (newPassword !== newPasswordConfirmation)
      throw new BadRequestException('Passwords do not match');

    const user = await getOneUser({ id: userId, active: true });
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    await updateUser(userId, {
      password: await encryptPassword(newPassword),
    });

    delete user.password;
    return user;
  }
}
