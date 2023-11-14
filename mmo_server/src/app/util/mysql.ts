import * as mysql from "mysql2";

export class MysqlClient {
    private pool: mysql.Pool;
    constructor(config: mysql.PoolOptions) {
        this.pool = mysql.createPool(config);
    }

    async query<T = any>(sql: string, args: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, args, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res as any);
                }
            });
        });
    }

    async insert<T>(table: string, value: T | T[]): Promise<{ "insertId": number }> {
        let arr = Array.isArray(value) ? value : [value];
        let columns: string[] = [];
        for (let key in arr[0]) {
            columns.push(key);
        }
        let args: any[] = [];
        for (let one of arr) {
            for (let key in one) {
                args.push(this.getArgValue(one[key]));
            }
        }
        let valTmpStr = "(" + new Array(columns.length).fill("?").join(",") + ")";
        let valTmpArrStr = new Array(arr.length).fill(valTmpStr).join(",");
        let sql = `insert into ${table}(${columns.join(",")}) values${valTmpArrStr}`;
        return this.query(sql, args)
    }

    async select<T>(table: string, columns: (keyof T)[] | "*", options?: I_selectOptions<T>): Promise<T[]> {
        let sql = `select ${columns === "*" ? "*" : columns.join(",")} from ${table}`;
        let args: any[] = [];
        if (options) {
            if (options.where) {
                let whereObj = { "sql": "" };
                this.setWhereOpts<T>(whereObj, args, options.where);
                sql += " where " + whereObj.sql;
            }
            if (options.orderBy) {
                let orders: Array<[keyof T, "asc" | "desc"]> = Array.isArray(options.orderBy[0]) ? options.orderBy : [options.orderBy] as any;
                let orderArr: string[] = [];
                for (let one of orders) {
                    orderArr.push((one as any)[0] + " " + one[1]);
                }
                sql += " order by " + orderArr.join(", ");
            }
            if (options.limit) {
                if (Array.isArray(options.limit)) {
                    sql += ` limit ${options.limit[0]},${options.limit[1]}`;
                } else {
                    sql += ` limit ${options.limit}`;
                }
            }
        }
        return this.query(sql, args)
    }

    async update<T>(table: string, obj: Partial<T>, options?: I_updateOptions<T>) {
        let args: any[] = [];
        let setArr: string[] = [];
        for (let key in obj) {
            setArr.push(`${key}=?`);
            args.push(this.getArgValue(obj[key]));
        }
        let sql = `update ${table} set ${setArr.join(",")}`;

        if (options) {
            if (options.where) {
                let whereObj = { "sql": "" };
                this.setWhereOpts<T>(whereObj, args, options.where);
                sql += " where " + whereObj.sql;
            }
            if (options.limit) {
                sql += ` limit ${options.limit}`;
            }
        }
        return this.query(sql, args);
    }

    async delete<T>(table: string, options?: I_deleteOptions<T>) {
        let sql = `delete from ${table}`;
        let args: any[] = [];
        if (options) {
            if (options.where) {
                let whereObj = { "sql": "" };
                this.setWhereOpts<T>(whereObj, args, options.where);
                sql += " where " + whereObj.sql;
            }
            if (options.limit) {
                sql += ` limit ${options.limit}`;
            }
        }
        return this.query(sql, args);
    }

    private getArgValue(value: any) {
        if (value == null) {
            return null;
        } else if (typeof value == "object") {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }

    private setWhereOpts<T>(sqlObj: { "sql": string }, args: any[], obj: I_where<T>) {
        if (Array.isArray(obj)) {
            let needAndOr = false;
            for (let one of obj) {
                if (needAndOr) {
                    sqlObj.sql += " " + one[0] + " ";
                }
                let needKuohao = Array.isArray(one[1]) && one[1].length > 1;
                if (needKuohao) {
                    sqlObj.sql += "(";
                }
                this.setWhereOpts(sqlObj, args, one[1]);
                if (needKuohao) {
                    sqlObj.sql += ")";
                }
                needAndOr = true;
            }
        } else {
            let whereArr: string[] = [];
            for (let key in obj) {
                let val = obj[key];
                let sign = "=";
                if (Array.isArray(val) && (signBijiaoObj as any)[val[0]]) {
                    sign = val[0]
                    val = val[1];
                }
                if (val == null) {
                    if (sign === "=") {
                        whereArr.push(key + " is null");
                    } else {
                        whereArr.push(key + " is not null");
                    }
                } else {
                    whereArr.push(key + " " + sign + " ?");
                    args.push(this.getArgValue(val));
                }
            }
            if (whereArr.length == 1) {
                sqlObj.sql += whereArr[0];
            } else {
                sqlObj.sql += "(" + whereArr.join(" and ") + ")";
            }
        }

    }

}

const signBijiaoObj = {
    "=": true,
    "!=": true,
    ">": true,
    "<": true,
    ">=": true,
    "<=": true,
}
type signBijiao = keyof typeof signBijiaoObj;
type whereOne<T> = {
    [P in keyof T]?: T[P] | [signBijiao, T[P]]
}
type I_where<T> = whereOne<T> | ["and" | "or", I_where<T>][]


interface I_selectOptions<T> {
    "where"?: I_where<T>,
    "orderBy"?: [keyof T, "asc" | "desc"] | Array<[keyof T, "asc" | "desc"]>,
    "limit"?: number | number[]
}
interface I_updateOptions<T> {
    "where"?: I_where<T>,
    "limit"?: number
}
interface I_deleteOptions<T> {
    "where"?: I_where<T>,
    "limit"?: number
}
