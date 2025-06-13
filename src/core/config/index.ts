import dotenv from 'dotenv';
const envFile =
  process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.prod';
dotenv.config({ path: envFile });

interface Config {
  runningProd: boolean;
  databaseType: string;
  port: number;
  db: {
    mongoose: {
      uri: string;
      name: string;
    };
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
  db: {
    mongoose: {
      uri: process.env.MONGO_URI || '',
      name: process.env.MONGOOSE_DBNAME || '',
    },
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
