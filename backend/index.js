import app from './app.js';
import dbConnect from './config/dbConnect.js';
import { validateEnv } from './config/validateEnv.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
    if (process.env.NODE_ENV !== 'test') {
        validateEnv();
    }

    await dbConnect();

    app.listen(port, () => {
        console.log(`server is running on port : ${port}`);
    });
};

startServer();
