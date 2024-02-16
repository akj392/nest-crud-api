import { Injectable, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Injectable()
export class RedisService {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            password: process.env.REDIS_PASS,
            socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT)
            }
        });

        if (!this.client.isOpen) {
            this.client.connect().then(() => {
                console.log('redis connected')
            });
        }


        this.client.on('disconnect', () => {
            console.log('Redis disconnected, connecting again....');
            this.client.connect();
        });
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });
    }

    async set(key: string, value: object): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value))
                .then(() => resolve())
                .catch(err => reject(err))
        });
    }

    async get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then((response) => resolve(JSON.parse(response)))
                .catch(err => reject('Error occurred in Redis get operation: ' + err))
        })
    }

    async delete(key: string): Promise<number | boolean> {
        return new Promise((resolve, reject) => {
            this.client.del(key)
                .then((flag) => {
                    resolve(flag)
                })
                .catch(err => reject(0))
        })
    }

    async getAllKeys(pattern: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let keys: string[] = [];
            let cursor = 0;
            const scanRecursive = () => {
                this.client.scan(cursor, { MATCH: pattern })
                    .then((response) => {
                        keys = keys.concat(response.keys);
                        const nextCursor = response.cursor
                        if (nextCursor === 0) {
                            resolve(keys);
                        } else {
                            cursor = nextCursor;
                            scanRecursive();
                        }
                    })
                    .catch((err) => {
                        reject(err);
                        return
                    })
            };
            scanRecursive();
        });
    }

    async getAllData() {
        try {
            const keys = await this.getAllKeys('*');
            const data = await Promise.all(keys.map(key => {
                return new Promise<any>((resolve, reject) => {
                    this.get(key)
                        .then(response => resolve(response))
                        .catch(err => reject(err))
                });
            }));
            return data || [];
        } catch (error) {
            console.error('Error retrieving data:', error);
        }
    }
}