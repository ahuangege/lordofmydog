import mysql = require("mysql");
type callback = (err: mysql.MysqlError | null, res?: any) => void
interface Dic<T = any> {
    [key: string]: any
}

export class MysqlClient {
    private pool: mysql.Pool;
    constructor(config: mysql.PoolConfig) {
        this.pool = mysql.createPool(config);
    }

    /**
     * 执行mysql语句
     * @param sql sql语句
     * @param args sql参数
     * @param cb 回调
     */
    query(sql: string, args: any, cb?: callback) {
        this.pool.getConnection((err, connection) => {
            if (!err) {
                connection.query(sql, args, (err, res) => {
                    connection.release();
                    cb && cb(err, res);
                });
            } else {
                cb && cb(err);
            }
        });
    }

}


export function getInsertSql(table: string, obj: Dic<any>) {
    let fieldArr: string[] = [];
    let valueArr: string[] = [];
    for (let key in obj) {
        fieldArr.push(key);
        let value = obj[key];
        if (typeof value === "string") {
            valueArr.push("'" + value + "'");
        } else if (typeof value === "object") {
            valueArr.push("'" + JSON.stringify(value) + "'");
        } else {
            valueArr.push(value);
        }
    }
    let sql = "insert into " + table + "(" + fieldArr.join(",") + ") values(" + valueArr.join(",") + ")";
    return sql;
}

export function getInsertSqlArr(table: string, arr: Dic<any>[]) {
    let fieldArr: string[] = [];
    for (let key in arr[0]) {
        fieldArr.push(key);
    }
    let valueArr: any[] = [];
    for (let one of arr) {
        let tmpArr: any[] = [];
        for (let key in one) {
            let value = one[key];
            if (typeof value === "string") {
                tmpArr.push("'" + value + "'");
            } else if (typeof value === "object") {
                tmpArr.push("'" + JSON.stringify(value) + "'");
            } else {
                tmpArr.push(value);
            }
        }
        valueArr.push(tmpArr);
    }
    for (let i = 0; i < valueArr.length; i++) {
        valueArr[i] = valueArr[i].join(",");
    }
    let sql = "insert into " + table + "(" + fieldArr.join(",") + ") values(" + valueArr.join("),(") + ")";
    return sql;
}