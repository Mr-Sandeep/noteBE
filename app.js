const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require("./src/router/router");
const reqLogger = require('./src/utilities/requestLogger');
const errLogger = require('./src/utilities/errorLogger');
const PORT = process.env.PORT || 3000;

app.use(cors(
    {
        origin: ["https://noteforyouapp.herokuapp.com", "http://localhost:4200"],
        methods: ["GET", "POST", "PUT"]
    }
    ));
app.use(bodyParser.json());
app.use(reqLogger);
app.use('/', router);
app.use(errLogger);

app.listen(PORT);
console.log("Server started at "+PORT);;