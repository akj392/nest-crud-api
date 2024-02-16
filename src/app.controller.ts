import { Body, Controller, Get, Put, Post, Param, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from 'src/user.model';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('/api')
export class AppController {
  constructor(private readonly dbService: RedisService) { }
  users: User[] = []

  @Get()
  async getUsers(): Promise<User[] | null> {
    return await this.dbService.getAllData()
  }

  @Get(":id")
  async getUser(@Param() params: any): Promise<User | String> {
    if (params.id) {
      const user = await this.dbService.get(params.id)
      if (user)
        return user

     return 'User not found!'
     
    }
  }

  @Put(":id")
  async updateUser(@Param() params: any, @Body() model: any): Promise<any> {
    let user = await this.dbService.get(params.id);
    if (user && user.id) {
      model.id = user.id
      user = await this.dbService.set(user.id, model)
      return {
        message: "User Updated Successfully",
        data: model
      }
    }
    return 'User not found!'
  }


  @Post()
  async createUser(@Body() model: any): Promise<any> {
    model.id = uuidv4();
    const user = new User(model);
    await this.dbService.set(user.id, user)
    return {
      message: "User Created Successfully",
      data: user
    }
  }

  @Delete(":id")
  async deleteUser(@Param() params: any): Promise<any> {
    if (params.id) {
      const flag = await this.dbService.delete(params.id)
      if (flag)
        return 'User deleted successfully.'
      return 'User not found!'
    }
  }


}
