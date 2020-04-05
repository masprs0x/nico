/// <reference types="koa__router" />
import Router from '@koa/router';
import { Context, Next } from 'koa';
import { ConfigRoutes } from '../../../typings';
declare const _default: <State, Custom>(router: Router<State, Custom>, config: ConfigRoutes<State, Custom>, routerPrifix?: string | undefined) => (ctx: Context, next: Next) => Promise<void>;
export = _default;
