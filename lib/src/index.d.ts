/// <reference types="hapi__joi" />
import Joi from '@hapi/joi';
import Application from '../typings';
import { DB } from './utils/db';
declare class Nico {
    Joi: Joi.Root;
    db?: DB;
    init(inputConfig?: Partial<Application.Config>): Promise<Application>;
}
declare const _default: Nico;
export = _default;
