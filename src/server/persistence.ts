import { IAlternateName, IMissingName, IUser, IWheelCategory, IWheelWord, Sport } from "../interfaces";
import * as http from "http";
import * as querystring from "querystring";
import log from "./log";

export default class Persistence {
    isValid: boolean;

    constructor(private persistenceServer: string, private persistencePort: number, private persistenceAppName: string, private persistenceAppKey: string) {
        this.isValid = !(!this.persistenceServer || !this.persistencePort || !this.persistenceAppName || !this.persistenceAppKey);
    }

    async getMissingNames(): Promise<IMissingName[]> {
        return await this.getAll<IMissingName>("lineupmissingnames");
    }

    async deleteMissingName(id: string): Promise<void> {
        return await this.deleteSingle("lineupmissingnames", id);
    }

    async deleteMissingNames(): Promise<void> {
        return await this.deleteAll("lineupmissingnames");
    }

    async getAlternateName(id: string): Promise<IAlternateName> {
        return await this.getSingle<IAlternateName>("lineupalternatenames", id);
    }

    async getAlternateNames(): Promise<IAlternateName[]> {
        return await this.getAll<IAlternateName>("lineupalternatenames");
    }

    async postAlternateName(alternateName: IAlternateName): Promise<IAlternateName> {
        return await this.postSingle("lineupalternatenames", alternateName);
    }

    async putAlternateName(alternateName: IAlternateName): Promise<void> {
        return await this.putSingle("lineupalternatenames", alternateName);
    }

    async deleteAlternateName(id: string): Promise<void> {
        return await this.deleteSingle("lineupalternatenames", id);
    }

    async getUserByUsername(username: string): Promise<IUser> {
        const users = await this.getAllFiltered<IUser>("users", { username: username });
        return users && users.length > 0 ? users[0] : undefined;
    }

    async postUser(user: IUser): Promise<IUser> {
        return await this.postSingle("users", user);
    }

    async putUser(user: IUser): Promise<void> {
        return await this.putSingle("users", user);
    }

    async getWheelCategory(id: string): Promise<IWheelCategory> {
        return await this.getSingle<IWheelCategory>("wheelcategories", id);
    }

    async getWheelCategories(): Promise<IWheelCategory[]> {
        return await this.getAll<IWheelCategory>("wheelcategories");
    }

    async deleteWheelCategory(id: string): Promise<void> {
        return await this.deleteSingle("wheelcategories", id);
    }

    async postWheelCategory(wheelCategory: IWheelWord): Promise<IWheelCategory> {
        return await this.postSingle("wheelcategories", wheelCategory);
    }

    async putWheelCategory(wheelCategory: IWheelWord): Promise<void> {
        return await this.putSingle("wheelcategories", wheelCategory);
    }

    async getWheelWord(id: string): Promise<IWheelWord> {
        return await this.getSingle<IWheelWord>("wheelwords", id);
    }

    async getWheelWords(): Promise<IWheelWord[]> {
        return await this.getAll<IWheelWord>("wheelwords");
    }

    async postWheelWord(wheelWord: IWheelWord): Promise<IWheelCategory> {
        return await this.postSingle("wheelwords", wheelWord);
    }

    async putWheelWord(wheelWord: IWheelWord): Promise<void> {
        return await this.putSingle("wheelwords", wheelWord);
    }

    async deleteWheelWord(id: string): Promise<void> {
        return await this.deleteSingle("wheelwords", id);
    }

    async deleteAll(table: string): Promise<void> {
        if (!this.isValid) {
            return undefined;
        }
        try {
            await this.sendRequest({
                path: `/${table}`,
                method: "DELETE"
            });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot delete all the records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async deleteSingle(table: string, id: string): Promise<void> {
        if (!this.isValid || !id) {
            return undefined;
        }
        try {
            await this.sendRequest({
                path: `/${table}/${id}`,
                method: "DELETE"
            });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot delete the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async getAll<T>(table: string): Promise<T[]> {
        if (!this.isValid) {
            return undefined;
        }
        try {
            const response = await this.sendRequest({
                path: `/${table}`,
                method: "GET"
            });
            const items: T[] = JSON.parse(response);
            if (Array.isArray(items)) {
                return items;
            }
            return undefined;
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read all the records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async getAllFiltered<T>(table: string, filter: T): Promise<T[]> {
        if (!this.isValid) {
            return undefined;
        }
        try {
            const response = await this.sendRequest({
                path: `/${table}?${querystring.stringify(filter)}`,
                method: "GET"
            });
            const items: T[] = JSON.parse(response);
            if (Array.isArray(items)) {
                return items;
            }
            return undefined;
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the filtered records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async getSingle<T>(table: string, id: string): Promise<T> {
        if (!this.isValid || !id) {
            return undefined;
        }
        try {
            const response = await this.sendRequest({
                path: `/${table}/${id}`,
                method: "GET"
            });
            return JSON.parse(response);
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the record with the specified ID. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async postSingle<T extends { id?: string }>(table: string, item: T): Promise<T> {
        if (!this.isValid || !item || item.id) {
            return item;
        }
        try {
            const response = await this.sendRequest({
                path: `/${table}`,
                method: "POST"
            }, JSON.stringify(item));
            return JSON.parse(response);
        } catch (error) {
            log.error(error);
            throw new Error("Cannot create the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async putSingle<T extends { id?: string }>(table: string, item: T): Promise<void> {
        if (!this.isValid || !item || !item.id) {
            return undefined;
        }
        try {
            await this.sendRequest({
                path: `/${table}/${item.id}`,
                method: "PUT"
            }, JSON.stringify(item));
        } catch (error) {
            log.error(error);
            throw new Error("Cannot update the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async sendRequest(request: http.RequestOptions, data?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const headers = request.headers || { };
            if (data) {
                headers["content-type"] = "application/json";
                headers["content-length"] = data.length;
            }
            headers["mcubed-app-name"] = this.persistenceAppName;
            headers["mcubed-app-key"] = this.persistenceAppKey;
            request.headers = headers;
            request.host = this.persistenceServer;
            request.port = this.persistencePort;
            const req = http.request(request, resp => {
                let body = "";
                resp.on("data", data => {
                    body += data;
                });
                resp.on("end", () => {
                    if (resp.statusCode === 200 || resp.statusCode === 201 || resp.statusCode === 202) {
                        resolve(body);
                    } else {
                        const errorObj = JSON.parse(body);
                        if (errorObj && errorObj.error) {
                            reject(errorObj.error);
                        } else {
                            reject(body);
                        }
                    }
                });
            }).on("error", error => {
                reject(error.message);
            });
            if (data) {
                req.write(data);
            }
            req.end();
        });
    }
}
