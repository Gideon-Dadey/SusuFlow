import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
        : undefined,
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    autoLogging: {
      ignore: (req) => {
        const url = req.url || '';
        return url.includes('/health') || url.includes('/api/docs');
      },
    },
    customProps: (req) => ({
      requestId: req.id,
    }),
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  },
};
