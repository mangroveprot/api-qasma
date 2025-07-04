import dotenv from 'dotenv';

// const envFile =
//   process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.prod';
// dotenv.config({ path: envFile });
dotenv.config();

interface Config {
  runningProd: boolean;
  databaseType: string;
  port: number;
  saltRounds: number;
  timeZone: string;
  db: {
    mongoose: {
      uri: string;
      name: string;
    };
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenExpireTime: number;
    refreshTokenSecret: string;
    refreshTokenExpireTime: number;
    tokenIssuer: string;
  };
  redis: {
    host: string;
    port: number;
    serverPort: number;
    tokenExpireTime: number; //15days
    blacklistExpireTime: number; //30days
  };
  rate: {
    limit: number;
    max: number;
  };
  bcrypt: {
    saltRound: number;
  };
  otp: {
    length: number;
    expiration: number;
    purposes: Record<
      string,
      { code: string; title: string; description: string; message: string }
    >;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
}

export const config: Config = {
  runningProd: process.env.NODE_ENV === 'production',
  databaseType: process.env.DATABASE_TYPE || '',
  port: parseInt(process.env.PORT || '3000', 10),
  saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  timeZone: process.env.TIME_ZONE || 'Asia/Manila',
  db: {
    mongoose: {
      uri: process.env.DB_URI || '',
      name: process.env.DB_NAME || '',
    },
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
    accessTokenExpireTime: parseInt(
      process.env.ACCESS_TOKEN_EXPIRE_TIME || '1',
      10,
    ), // access token takes hour
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshTokenExpireTime: parseInt(
      process.env.REFRESH_TOKEN_EXPIRE_TIME || '7',
      10,
    ), // refresh token takes days
    tokenIssuer: process.env.TOKEN_ISSUER || 'your-issuer',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    serverPort: parseInt(process.env.REDIS_SERVER_PORT || '9079', 10),
    tokenExpireTime: parseInt(
      process.env.REDIS_TOKEN_EXPIRE_TIME || '31536000',
      10,
    ),
    blacklistExpireTime: parseInt(
      process.env.REDIS_BLACKLIST_EXPIRE_TIME || '2592000',
      10,
    ),
  },
  rate: {
    limit: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  bcrypt: {
    saltRound: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  otp: {
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
    expiration: parseInt(process.env.OTP_EXPIRATION || '5') * 60 * 100,
    purposes: {
      FORGOT_PASSWORD: {
        code: 'FORGOT_PASSWORD',
        title: 'Password Reset OTP',
        description: 'Reset your password',
        message: 'Your OTP code for resetting your password is:',
      },
      ACCOUNT_VERIFICATION: {
        code: 'ACCOUNT_VERIFICATION',
        title: 'Account Verification OTP',
        description: 'Verify your account',
        message: 'Your OTP code for account verification is:',
      },
    },
  },
  mail: {
    host:
      process.env.NODE_ENV === 'production'
        ? process.env.SMTP_HOST || ''
        : process.env.MAILDEV_HOST || 'localhost',
    port: parseInt(
      process.env.NODE_ENV === 'production'
        ? process.env.SMTP_PORT || '587'
        : process.env.MAILDEV_PORT || '1025',
      10,
    ),
    user:
      process.env.NODE_ENV === 'production' ? process.env.SMTP_USER || '' : '',
    pass:
      process.env.NODE_ENV === 'production' ? process.env.SMTP_PASS || '' : '',
    from: process.env.FROM_EMAIL || 'no-reply@myapp.com',
    fromName: process.env.FROM_NAME || 'QASMA',
  },
};
