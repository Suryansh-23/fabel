import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_KEY: process.env.API_KEY || '',
    GOOGLE_VERTEX_LOCATION: process.env.GOOGLE_VERTEX_LOCATION || 'us-central1'
};
