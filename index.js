import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/users.js';

const app = express();

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(
    cors({ 
        Origin: 'http://localhost:5000', 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'Origin', 
            'x-access-token', 
            'XSRF-TOKEN'
        ], 
        preflightContinue: false
    })
  );

app.use('/', userRoutes);

const CONNECTION_URL = 'mongodb+srv://admin:admin@cluster0.ddvsetx.mongodb.net/?retryWrites=true&w=majority';
const PORT = process.env.PORT || 6666;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`)))
        .catch((error) => console.log(error.message));
