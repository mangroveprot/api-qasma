import JWT, { SignOptions } from 'jsonwebtoken';
import { ApiResponse, ErrorResponse } from '../utils';
import { logger } from './logger.service';
import { config } from '../../../core/config';
import { RedisService } from './index';

// ERROR RESPONSE
const INTERNAL_ERROR = new ErrorResponse(
  'INTERNAL_SERVER_ERROR',
  'Internal Server Error',
);
const UNAUTHORIZED_ERROR = new ErrorResponse('UNAUTHORIZED', 'Unauthorized');

class JwtService {
  private accessTokenSecret: string;
  private accessTokenExpireTime: number;
  private refreshTokenSecret: string;
  private refreshTokenExpireTime: number;
  private tokenIssuer: string;
  private redisTokenExpireTime: number;
  private redisBlacklistExpireTime: number;

  constructor() {
    this.accessTokenSecret = config.jwt.accessTokenSecret;
    this.accessTokenExpireTime = config.jwt.accessTokenExpireTime;
    this.refreshTokenSecret = config.jwt.refreshTokenSecret;
    this.refreshTokenExpireTime = config.jwt.refreshTokenExpireTime;
    this.tokenIssuer = config.jwt.tokenIssuer;
    this.redisTokenExpireTime = config.redis.tokenExpireTime;
    this.redisBlacklistExpireTime = config.redis.blacklistExpireTime;
  }

  signAccessToken(idNumber: string, role: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const payload = { role };
      const options: SignOptions = {
        expiresIn: `${this.accessTokenExpireTime}h`,
        issuer: this.tokenIssuer,
        audience: idNumber,
      };

      JWT.sign(
        payload,
        this.accessTokenSecret,
        options,
        (err: any, token?: string) => {
          if (err || !token) {
            logger.error(err?.message, err);
            return reject(INTERNAL_ERROR);
          }
          resolve(token);
        },
      );
    });
  }

  verifyAccessToken(req: any, res: any, next: any): void {
    if (!req.headers['authorization']) {
      const errorResponse = new ErrorResponse('UNAUTHORIZED', 'Unauthorized', [
        'No authorization header',
      ]);
      return ApiResponse.error(res, {
        success: false,
        error: errorResponse,
      }) as any;
    }

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(
      token,
      this.accessTokenSecret,
      async (err: any, payload: any) => {
        if (err) {
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
          const errorResponse = new ErrorResponse('UNAUTHORIZED', message);
          return ApiResponse.error(res, {
            success: false,
            error: errorResponse,
          });
        }
        try {
          const blacklisted = await RedisService.isBlacklistedInRedis(token);
          // if blacklist it means logged out
          if (blacklisted) {
            const errorResponse = new ErrorResponse('FORBIDDEN', 'Forbidden', [
              'Token is blacklisted',
            ]);
            return ApiResponse.error(res, {
              success: false,
              error: errorResponse,
            });
          }
        } catch (error) {
          return ApiResponse.error(res, {
            success: false,
            error: error as ErrorResponse,
          });
        }
        req.payload = payload;
        next();
      },
    );
  }

  checkAccessToken(accessToken: string): Promise<{ idNumber: string }> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        accessToken,
        this.accessTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            const message =
              err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            const errorResponse = new ErrorResponse('UNAUTHORIZED', message);
            return reject(errorResponse);
          }

          const idNumber = payload?.aud as string;

          resolve({ idNumber });
        },
      );
    });
  }

  async signRefreshToken(idNumber: string, role: string): Promise<string> {
    const payload = { role };
    const options: SignOptions = {
      expiresIn: `${this.refreshTokenExpireTime}d`,
      issuer: this.tokenIssuer,
      audience: idNumber,
    };

    try {
      const token = await new Promise<string>((resolve, reject) => {
        JWT.sign(
          payload,
          this.refreshTokenSecret,
          options,
          (err: any, token) => {
            if (err || !token) {
              logger.error(err?.message, err);
              return reject(INTERNAL_ERROR);
            }
            resolve(token);
          },
        );
      });

      // Store the token in redis
      await RedisService.storeInRedis(idNumber, token);

      return token;
    } catch (error: any) {
      logger.error(error.message, error);
      throw INTERNAL_ERROR;
    }
  }

  verifyRefreshToken(
    refreshToken: string,
  ): Promise<{ idNumber: string; role: string }> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        this.refreshTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            const errorResponse = new ErrorResponse(
              'UNAUTHORIZED',
              'Unauthorized',
            );
            return reject(errorResponse);
          }

          const idNumber = payload?.aud as string;
          const role = payload?.role as string;

          RedisService.client.get(idNumber, (redisErr: any, result: any) => {
            if (redisErr) {
              logger.error(redisErr.message, redisErr);
              return reject(INTERNAL_ERROR);
            }

            if (refreshToken === result) {
              return resolve({ idNumber, role });
            }

            return reject(UNAUTHORIZED_ERROR);
          });
        },
      );
    });
  }

  checkRefreshToken(refreshToken: string): Promise<{ idNumber: string }> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        this.refreshTokenSecret,
        (err: any, payload: any) => {
          if (err) {
            const errorResponse = new ErrorResponse(
              'UNAUTHORIZED',
              'Unauthorized',
            );
            return reject(errorResponse);
          }

          const idNumber = payload?.aud as string;
          RedisService.client.get(idNumber, (redisErr: any, result: any) => {
            if (redisErr) {
              logger.error(redisErr.message, redisErr);
              return reject(INTERNAL_ERROR);
            }

            if (refreshToken === result) {
              return resolve({ idNumber });
            }

            return reject(UNAUTHORIZED_ERROR);
          });
        },
      );
    });
  }
}

export default new JwtService();
