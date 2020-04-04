import { Context, Next } from 'koa';
import { ConfigCustom } from '../../../typings';
declare const _default: (custom: ConfigCustom) => (ctx: Context, next: Next) => Promise<void>;
export = _default;
