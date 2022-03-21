'use strict';

const KEY_FILE_NAME = 'service-account.json';

const path = require('path');
const fs = require('fs');

const SpreadsheetClient = require('./spreadsheet.js');

require('dotenv').config();

async function main() {
    try {
        const keyFileName = path.join(__dirname, KEY_FILE_NAME);
        fs.writeFileSync(keyFileName, process.env.SERVICE_ACCOUNT_JSON);
        const client = new SpreadsheetClient(keyFileName, process.env.SPREADSHEET_ID);

        const values = await client.getAllItems('消耗品');
        console.log(values);

        client.updateItem('消耗品', 34, '在庫ルール', 'テスト');
        client.updateItem('消耗品', 34, '要発注', true);

        const value = await client.getItem('消耗品', 34);
        console.log(value);
    } catch (e) {
        console.log(e);
    }
}

main();