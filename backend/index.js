import app from './app.js';
import dbConnect from './config/dbConnect.js';

//Database
dbConnect();

//Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
});
