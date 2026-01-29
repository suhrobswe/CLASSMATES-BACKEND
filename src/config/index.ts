import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT),
  ADMIN_USERNAME: String(process.env.ADMIN_USERNAME),
  ADMIN_FULLNAME: String(process.env.ADMIN_FULLNAME),
  ADMIN_PASSWORD: String(process.env.ADMIN_PASSWORD),

  TOKEN: {
    ACCESS_TOKEN_KEY: String(process.env.ACCESS_TOKEN_KEY),
    ACCESS_TOKEN_TIME: Number(process.env.ACCESS_TOKEN_TIME),
    REFRESH_TOKEN_KEY: String(process.env.REFRESH_TOKEN_KEY),
    REFRESH_TOKEN_TIME: Number(process.env.REFRESH_TOKEN_TIME),
  },

  FILE_PATH: String(process.env.FILE_PATH),
  BASE_URL: String(process.env.BASE_URL),
  DB_URI: String(process.env.DB_URI),

  NODE_ENV: String(process.env.NODE_ENV),
};
