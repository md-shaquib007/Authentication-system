import mongoose from 'mongoose';

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(
            `The database is connected to ${conn.connection.host} and ${conn.connection.name}`
        );
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default dbConnect;
