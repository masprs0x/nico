import Koa from 'koa';
import { Config } from '../typings';
declare class Nico {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>;
    init<State, Custom>(inputConfig?: Partial<Config<State, Custom>>): Promise<Koa<Koa.DefaultState, Koa.DefaultContext>>;
}
declare const _default: Nico;
export = _default;
