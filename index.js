const express = require('express');
const { demoLogic } = require('./demoLogic');
const { exampleLogic } = require('./exampleLogic');
const { builderLogic } = require('./builderLogic');
const app = express();

const PORT = process.env.PORT || 4000;

app.get('/demo', (req, res) => {
    demoLogic(res);
});

app.get("/example", (req, res) => {
    exampleLogic(res);
});

app.get("/builders", (req, res) => {
    builderLogic(res);
});

app.get("/", (req, res) => {
    res.send('render puppeteer is up and running');
})


app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

