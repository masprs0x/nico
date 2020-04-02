import Redis from 'ioredis';
import Application from '../../typings/app';
export declare class DB {
    redis: Redis.Redis | undefined;
    config: Application.ConfigDatastores;
    constructor(config: Application.ConfigDatastores);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
