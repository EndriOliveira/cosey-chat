import { Injectable } from '@nestjs/common';
import { getUserById, getUsers } from './user.repository';
import { FindUsersQueryDto } from './dto/findUsersQuery.dto';

@Injectable()
export class UserService {
  async getUserById(id: string) {
    return await getUserById(id);
  }

  async getUsers(query: FindUsersQueryDto) {
    return await getUsers(query);
  }
}
