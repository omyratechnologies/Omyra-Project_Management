import mongoose from 'mongoose';
import { config } from './environment.js';
export const connectDatabase = async () => {
    try {
        const connection = await mongoose.connect(config.mongoUri);
        console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connected');
});
mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
});
mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB disconnected');
});
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed due to app termination');
    process.exit(0);
});
