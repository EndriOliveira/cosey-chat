import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createCode, getOneCode, updateManyCode } from './code.repository';
import { generateRandomCode } from '../../utils/generateRandomCode';
import { UserService } from '../user/user.service';
import * as dayjs from 'dayjs';
import { Code } from '@prisma/client';

@Injectable()
export class CodeService {
  constructor(private userService: UserService) {}

  async createCode(userId: string): Promise<string> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('User Not Found');

    let code = generateRandomCode({
      length: 6,
      lowerCaseLetters: true,
      upperCaseLetters: true,
      numbers: true,
    });
    let codeExists = true;

    while (codeExists) {
      const userCodeExists = await getOneCode({ code, active: true });
      if (!userCodeExists) codeExists = false;
      else
        code = generateRandomCode({
          length: 6,
          lowerCaseLetters: true,
          upperCaseLetters: true,
          numbers: true,
        });
    }

    await updateManyCode({ userId: user.id, active: true }, { active: false });
    await createCode({ userId, code });
    return code;
  }

  async validateCode(code: string): Promise<Code> {
    const userCode = await getOneCode({ code, active: true }, [
      'id',
      'userId',
      'createdAt',
    ]);
    if (!userCode) throw new NotFoundException('Code Not Found');

    await this.userService.getUserById(userCode.userId);

    const now = dayjs(new Date());
    const codeDate = dayjs(userCode.createdAt);
    const diff = now.diff(codeDate, 'minute');
    if (diff >= 60) {
      await updateManyCode({ code }, { active: false });
      throw new UnauthorizedException('Code has been expired');
    }

    await updateManyCode({ code }, { active: false });
    return userCode as Code;
  }
}
