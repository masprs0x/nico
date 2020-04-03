import Redis from 'ioredis';
import mongoose from 'mongoose';
import Application from '../../typings';
export declare class DB {
    default?: typeof mongoose;
    cache?: Redis.Redis;
    config?: Application.ConfigDatastores;
    constructor(config: Application.ConfigDatastores);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
