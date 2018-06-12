import { IAlternateName, IMissingName, IUser, IWheelCategory, IWheelWord, Sport } from "../interfaces";
import { MongoClient, Db, ObjectID } from "mongodb";
import log from "./log";

export default class Persistence {
    isValid: boolean;
    client: MongoClient;
    db: Db;

    constructor(private mongoConnectionUrl: string, private mongoDBName: string) {
        this.isValid = !(!this.mongoConnectionUrl || !this.mongoDBName);
    }

    async connectDB(): Promise<Db> {
        if (!this.client) {
            this.client = await MongoClient.connect(this.mongoConnectionUrl);
        }
        if (!this.db) {
            this.db = this.client.db(this.mongoDBName);
        }
        return this.db;
    }

    disconnectDB(): void {
        if (this.db) {
            this.db = undefined;
        }
        if (this.client) {
            this.client.close();
            this.client = undefined;
        }
    }

    async getMissingNames(): Promise<IMissingName[]> {
        return await this.getAll<IMissingName>("lineupmissingnames");
    }

    async deleteMissingName(id: ObjectID): Promise<void> {
        return await this.deleteSingle("lineupmissingnames", id);
    }

    async deleteMissingNames(): Promise<void> {
        return await this.deleteAll("lineupmissingnames");
    }

    async getAlternateName(id: ObjectID): Promise<IAlternateName> {
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

    async deleteAlternateName(id: ObjectID): Promise<void> {
        return await this.deleteSingle("lineupalternatenames", id);
    }

    async getUserByUsername(username: string): Promise<IUser> {
        return await this.getSingleFiltered<IUser>("users", { username: username });
    }

    async postUser(user: IUser): Promise<IUser> {
        return await this.postSingle("users", user);
    }

    async putUser(user: IUser): Promise<void> {
        return await this.putSingle("users", user);
    }

    async getWheelCategory(id: ObjectID): Promise<IWheelCategory> {
        return await this.getSingle<IWheelCategory>("wheelcategories", id);
    }

    async getWheelCategories(): Promise<IWheelCategory[]> {
        return await this.getAll<IWheelCategory>("wheelcategories");
    }

    async deleteWheelCategory(id: ObjectID): Promise<void> {
        return await this.deleteSingle("wheelcategories", id);
    }

    async postWheelCategory(wheelCategory: IWheelWord): Promise<IWheelCategory> {
        return await this.postSingle("wheelcategories", wheelCategory);
    }

    async putWheelCategory(wheelCategory: IWheelWord): Promise<void> {
        return await this.putSingle("wheelcategories", wheelCategory);
    }

    async getWheelWord(id: ObjectID): Promise<IWheelWord> {
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

    async deleteWheelWord(id: ObjectID): Promise<void> {
        return await this.deleteSingle("wheelwords", id);
    }

    async deleteAll(table: string): Promise<void> {
        if (!this.isValid) {
            return undefined;
        }
        try {
            const db = await this.connectDB();
            await db.dropCollection(table);
        } catch (error) {
            log.error(error);
            throw new Error("Cannot delete all the records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async deleteSingle(table: string, id: ObjectID): Promise<void> {
        if (!this.isValid || !id) {
            return undefined;
        }
        try {
            const db = await this.connectDB();
            await db.collection(table).deleteOne({ _id: id });
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
            const db = await this.connectDB();
            const cursor = await db.collection(table).find<T>();
            return await cursor.toArray();
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
            const db = await this.connectDB();
            const cursor = await db.collection(table).find<T>(filter);
            return await cursor.toArray();
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the filtered records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async getSingle<T>(table: string, id: ObjectID): Promise<T> {
        if (!this.isValid || !id) {
            return undefined;
        }
        try {
            const db = await this.connectDB();
            return await db.collection(table).findOne<T>({ _id: id });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the record with the specified ID. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async getSingleFiltered<T>(table: string, filter: T): Promise<T> {
        try {
            const db = await this.connectDB();
            return await db.collection(table).findOne<T>(filter);
        } catch (error) {
            throw error;
        }
    }

    async postSingle<T extends { _id?: ObjectID }>(table: string, item: T): Promise<T> {
        if (!this.isValid || !item || item._id) {
            return item;
        }
        delete item._id;
        try {
            const db = await this.connectDB();
            const result = await db.collection(table).insertOne(item);
            item._id = result.insertedId;
            return item;
        } catch (error) {
            log.error(error);
            throw new Error("Cannot create the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    async putSingle<T extends { _id?: ObjectID }>(table: string, item: T): Promise<void> {
        if (!this.isValid || !item || !item._id) {
            return undefined;
        }
        try {
            const db = await this.connectDB();
            await db.collection(table).findOneAndUpdate({ _id: item._id }, { $set: item });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot update the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }
}
