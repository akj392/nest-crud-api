/* eslint-disable prettier/prettier */
export class User {
    id: string;
    username: string;
    age: number;
    hobbies: [];
    constructor(obj: any) {
        this.id = obj.id;
        this.username = obj.username;
        this.age = obj.age;
        this.hobbies = obj.hobbies || []
    }
}