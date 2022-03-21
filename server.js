'use strict';

const KEY_FILE_NAME = 'service-account.json';

const path = require('path');
const fs = require('fs');
const express = require('express');

const SpreadsheetClient = require('./spreadsheet.js');

require('dotenv').config();

async function main() {
    try {
        const keyFileName = path.join(__dirname, KEY_FILE_NAME);
        fs.writeFileSync(keyFileName, process.env.SERVICE_ACCOUNT_JSON);
        const client = new SpreadsheetClient(keyFileName, process.env.SPREADSHEET_ID);

        const port = process.env.PORT || 8080;

        const app = express();
        app.set('view engine', 'ejs');
        app.set('views', 'views');
        app.use(express.static(`${__dirname}/public`));

        app.get('/items/:itemNo', function (req, res) {
            res.render('item.ejs', { itemNo: req.params.itemNo });
        });

        app.get('/api/items', async function (req, res, next) {
            console.log('received request, endpoint: get ' + req.originalUrl);
            const values = await client.getAllItems('消耗品');
            res.json(values);
        });
        app.get('/api/items/:itemNo', async function (req, res, next) {
            console.log('received request, endpoint: get ' + req.originalUrl);
            const itemNo = Number(req.params.itemNo);
            const value = await client.getItem('消耗品', itemNo);
            res.json(value);
        });
        app.put('/api/items/:itemNo/order-request', async function (req, res) {
            console.log('received request, endpoint: put ' + req.originalUrl);
            const itemNo = Number(req.params.itemNo);
            client.updateItem('消耗品', itemNo, '要発注', true);
            res.json({});
        });
        app.put('/api/items/:itemNo/order-complete', async function (req, res) {
            console.log('received request, endpoint: put ' + req.originalUrl);
            const itemNo = Number(req.params.itemNo);
            client.updateItem('消耗品', itemNo, '要発注', false);
            res.json({});
        });

        var server = app.listen(port, function () {
            console.log('Node.js is listening to PORT:' + server.address().port);
        });
    } catch (e) {
        console.log(e);
    }
}

main();