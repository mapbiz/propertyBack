import * as log4js from "log4js";

log4js.configure({
   appenders: {
      default: {
         type: "stdout",
         level: 'debug',
      },
      server: {
         type: "stdout",
         layout: {
            type: 'pattern',
            pattern: '%r %c %m', 
         },
      },
      serverError: {
         type: "fileSync",
         filename: "logs/server-errors.log",
         level: 'fatal',
      },
      db: {
         type: "fileSync",
         filename: "logs/mongo.log",
      },
      fileUpload: {
         type: 'file',
         filename: "logs/file-uploaded-errors.log",
      },
   },
   categories: {
      default: {
         appenders: ['default'],
         level: "debug",
      },
      fileUpload: {
         appenders: ['fileUpload'],
         level: 'error',
      },
      dbError: {
         appenders: ['db'],
         level: 'error',
      },
      serverFatalError: {
         appenders: ['serverError'],
         level: 'fatal',
      },
      serverResponce: {
         appenders: ['server'],
         level: 'info',
      },
      serverRequest: {
         appenders: ['server'],
         level: 'info',
      },
      serverError: {
         appenders: ['server'],
         level: 'error',
      },
   },
});

log4js.levels.MARK

export const serverResponce: log4js.Logger = log4js.getLogger('serverResponce');
export const serverRequest: log4js.Logger = log4js.getLogger('serverRequest');
export const serverError: log4js.Logger = log4js.getLogger('serverError');
export const serverFatalError: log4js.Logger = log4js.getLogger('serverFatalError');
export const dbError: log4js.Logger = log4js.getLogger('dbError');
export const fileUpload: log4js.Logger = log4js.getLogger('fileUpload');