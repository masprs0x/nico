import IORedis from 'ioredis';
declare const _default: {
    new (): {
        url: string;
        redis: IORedis.Redis;
        init(url: string): void;
        connect(): Promise<void>;
        disconnect(): Promise<void>;
    };
};
export = _default;
