import { Context, Next } from 'koa';
import { ConfigSecurity } from '../../../typings';
declare const _default: (config: ConfigSecurity) => (ctx: Context, next: Next) => Promise<void>;
export = _default;
