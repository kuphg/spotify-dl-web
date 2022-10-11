var express = require('express');
var app = express();

var indexRouter = require('./routes');
app.use('/id', indexRouter);

app.listen(3000, () => console.log("Listening"));