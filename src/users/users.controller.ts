/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from './user.model';
import { RedisService } from 'src/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
export class UsersController {

    constructor(private dbService: RedisService) { }
    users: User[] = []
    
    @Get()
    getUsers(): User[] {
        return this.users
    }

    @Get(":id")
    async getUser(@Param() params: any): Promise<User | String> {
        const user = await this.dbService.get(params.id)
        if (user)
            return user
        return 'User not found!'
    }

    @Post()
    async createUser(@Body() model: any): Promise<any> {
        model.id = uuidv4();
        const user = new User(model);
        await this.dbService.set(user.id, JSON.stringify(user))
        return {
            message: "User Created Successfully",
            data: user
        }
    }

}
