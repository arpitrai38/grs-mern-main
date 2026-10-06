const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config()

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('❌ Error: MONGO_URI environment variable is missing!');
            console.error('Please configure MONGO_URI in your Render environment variables or .env file.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB Atlas Connection Error:', error.message);

        // Fallback for local development if local MongoDB service is running
        if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
            try {
                console.log('🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/grs_db)...');
                await mongoose.connect('mongodb://127.0.0.1:27017/grs_db');
                console.log('✅ Connected to local MongoDB fallback successfully!');
                return;
            } catch (localErr) {
                // Ignore fallback error
            }
        }

        console.error('Tip: Check if your MongoDB Atlas user credentials are valid and IP whitelist allows 0.0.0.0/0');
    }
};

module.exports = connectDB