const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_BOOLEAN = 'bool'
const SHEET_SETTING = {
    range: {
        headerRow: '1',
        rowMin: '2',
        rowMax: '',
        columnMin: 'A',
        columnMax: 'D',
    },
    columnSettings: {
        'No': { key: 'itemNo', type: TYPE_NUMBER, column: 'A' },
        '品目': { key: 'name', type: TYPE_STRING, column: 'B' },
        '要発注': { key: 'shouldOrder', type: TYPE_BOOLEAN, column: 'C' },
        '在庫ルール': { key: 'rule', type: TYPE_STRING, column: 'D' },
    },
    shouldOrderTargetKey: 'shouldOrder',
};

const { google } = require('googleapis');
const sheets = google.sheets('v4');

module.exports = class SpreadsheetClient {
    /**
     * コンストラクタ
     * @param {string} keyFilePath サービスアカウントのキーファイルパス
     * @param {string} spreadsheetId 操作対象のスプレッドシートID
     */
    constructor(keyFilePath, spreadsheetId) {
        this.keyFilePath = keyFilePath;
        this.spreadsheetId = spreadsheetId;
    }

    /**
     * 全項目を取得
     * @param {string} sheetName 取得対象シート名
     * @return {object[]} 全項目。キー名は SHEET_SETTING に従って設定される。
     */
    async getAllItems(sheetName) {
        const header = await this.#getHeader(sheetName);

        const itemRange = sheetName + '!' + SHEET_SETTING.range.columnMin + SHEET_SETTING.range.rowMin + ':' + SHEET_SETTING.range.columnMax + SHEET_SETTING.range.rowMax;
        const values = await this.#getValues(itemRange);

        let items = [];
        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const rowValues = values[rowIndex];

            items.push(this.#rowValuesToItem(rowValues, header));
        }
        return items;
    }

    /**
     * 指定の品目情報を取得
     * @param {string} sheetName 取得対象のシート名
     * @param {number} itemNo 取得対象の品目No
     * @return {object} 品目情報。キー名は SHEET_SETTING に従って設定される。
     */
    async getItem(sheetName, itemNo) {
        const header = await this.#getHeader(sheetName);
        const rowNo = this.#itemNoToRowNo(itemNo);

        const range = sheetName + '!' + SHEET_SETTING.range.columnMin + rowNo + ':' + SHEET_SETTING.range.columnMax + rowNo;
        let values = await this.#getValues(range);
        return this.#rowValuesToItem(values[0], header);
    }

    /**
     * 指定品目の情報を更新
     * @param {string} sheetName 更新対象のシート名
     * @param {number} itemNo 更新対象の品目No
     * @param {string} label 更新対象の列名
     * @param {(string | boolean)} value 新しい値
     */
    async updateItem(sheetName, itemNo, label, value) {
        const rowNo = this.#itemNoToRowNo(itemNo);
        const column = SHEET_SETTING.columnSettings[label].column;

        const range = sheetName + '!' + column + rowNo;
        this.#updateValues(range, [[value]]);
    }

    /**
     * 品目Noをスプレッドシートの行番号に変換
     * @param {number} itemNo 品目No
     * @return {number} 行番号
     */
    #itemNoToRowNo(itemNo) {
        return itemNo + 1;
    }

    /**
     * スプレッドシート1行分の情報を品目情報に変換する
     * @param {string[]} rowValues スプレッドシート1行分の情報
     * @param {string[]} headerValues ヘッダ1行分の情報
     * @return {object} 品目情報。キー名は SHEET_SETTING に従って設定される。
     */
    #rowValuesToItem(rowValues, headerValues) {
        let item = {};
        for (let colIndex = 0; colIndex < rowValues.length; colIndex++) {
            const label = headerValues[colIndex];
            if (!(label in SHEET_SETTING.columnSettings)) {
                continue;
            }

            const key = SHEET_SETTING.columnSettings[label].key;
            const orgValue = rowValues[colIndex];

            let value;
            switch (SHEET_SETTING.columnSettings[label].type) {
                case TYPE_NUMBER:
                    value = Number(orgValue);
                    break;
                case TYPE_BOOLEAN:
                    value = orgValue.toLocaleLowerCase() == 'true';
                    break;
                default:
                    value = orgValue;
            }
            item[key] = value;
        }
        return item;
    }

    /**
     * ヘッダーの値を取得
     * @param {string} sheetName 取得対象のシート名
     * @return {PromiseLike<string[]>} ヘッダー
     */
    async #getHeader(sheetName) {
        const headerRange = sheetName + '!' + SHEET_SETTING.range.columnMin + SHEET_SETTING.range.headerRow + ':' + SHEET_SETTING.range.columnMax + SHEET_SETTING.range.headerRow;
        const headerRows = await this.#getValues(headerRange);
        return headerRows[0]
    }

    /**
     * 指定範囲の値を取得
     * @param {string} range 取得範囲
     * @return {PromiseLike<string[][]>} 値
     */
    async #getValues(range) {
        const auth = await google.auth.getClient({
            keyFile: this.keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const res = await sheets.spreadsheets.values.get(
            {
                auth: auth,
                spreadsheetId: this.spreadsheetId,
                range: range,
            }
        );
        return res.data.values;
    }

    /**
     * 指定範囲の値を更新
     * @param {string} range 更新範囲
     * @param {string[][]} values 値
     */
    async #updateValues(range, values) {
        const auth = await google.auth.getClient({
            keyFile: this.keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        sheets.spreadsheets.values.update(
            {
                auth: auth,
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: values
                }
            }
        );
    }
}
