/// <reference types="koa__router" />
import Router from '@koa/router';
import Application from '../../../typings/app';
declare const _default: (router: Router<Application.State, Application.Custom>, config: any) => (ctx: Application.Context, next: Application.Next) => Promise<void>;
export = _default;
