import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from '../../config';
import { default as AllRoutes } from '../../../common/global-router';
import { apiRateLimiter } from '../../../common/shared/middlewares';
import {
  GlobalErrorHandler,
  NotFoundHandler,
} from '../../../common/shared/utils';

const morganEnv = config.runningProd ? 'combined' : 'dev';
const app = express();

app.use(cors());
app.use(helmet()); // Use Helmet to add various security headers
app.use(helmet.xssFilter()); // Protect against XSS attacks
app.use(helmet.noSniff()); // Prevent MIME type sniffing
app.use(morgan(morganEnv));
app.disable('x-powered-by'); // Disable X-Powered-By header
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(apiRateLimiter);

//API routes
app.use('/api', AllRoutes);

// error handler
app.use(GlobalErrorHandler); // catch unexpected errors
app.use(NotFoundHandler); //catch all unmatched routes

const server = http.createServer(app);

export default server;
