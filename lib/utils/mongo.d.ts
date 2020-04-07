import Mongoose from 'mongoose';
declare const _default: {
    new (): {};
    connect(mongoose: typeof Mongoose, url: string): Promise<void>;
    disconnect(mongoose: typeof Mongoose): Promise<void>;
};
export = _default;
