import { IAlternateName, IMissingName, IUser, IWheelCategory, IWheelWord } from "../interfaces";
import { MongoClient, Db, ObjectId } from "mongodb";
import log from "./log";

export interface ICollectionPersistence<T extends { _id?: ObjectId }> {
    deleteAll(): Promise<void>;
    deleteSingle(id: ObjectId): Promise<void>;
    getAll(): Promise<T[]>;
    getAllFiltered(filter: T): Promise<T[]>;
    getSingle(id: ObjectId): Promise<T>;
    getSingleFiltered(filter: T): Promise<T>;
    insertSingle(document: T): Promise<T>;
    insertMany(documents: IterableIterator<T>): Promise<T[]>;
    updateSingle(document: T): Promise<void>;
}

export default class Persistence {
    private isValid: boolean;
    private client: MongoClient;
    private db: Db;
    lineupalternatenames: ICollectionPersistence<IAlternateName>;
    lineupmissingnames: ICollectionPersistence<IMissingName>;
    users: ICollectionPersistence<IUser>;
    wheelcategories: ICollectionPersistence<IWheelCategory>;
    wheelwords: ICollectionPersistence<IWheelWord>;

    constructor(private mongoConnectionUrl: string, private mongoDBName: string) {
        this.isValid = !(!this.mongoConnectionUrl || !this.mongoDBName);
        this.lineupalternatenames = this.createCollectionPersistence<IAlternateName>("lineupalternatenames");
        this.lineupmissingnames = this.createCollectionPersistence<IMissingName>("lineupmissingnames");
        this.users = this.createCollectionPersistence<IUser>("users");
        this.wheelcategories = this.createCollectionPersistence<IWheelCategory>("wheelcategories");
        this.wheelwords = this.createCollectionPersistence<IWheelWord>("wheelwords");
    }

    private createCollectionPersistence<T extends { _id?: ObjectId }>(table: string): ICollectionPersistence<T> {
        return {
            deleteAll: () => this.deleteAll(table),
            deleteSingle: (id: ObjectId) => this.deleteSingle(table, id),
            getAll: () => this.getAll(table),
            getAllFiltered: (filter: T) => this.getAllFiltered(table, filter),
            getSingle: (id: ObjectId) => this.getSingle(table, id),
            getSingleFiltered: (filter: T) => this.getSingleFiltered(table, filter),
            insertSingle: (document: T) => this.insertSingle(table, document),
            insertMany: (documents: IterableIterator<T>) => this.insertMany(table, documents),
            updateSingle: (document: T) => this.updateSingle(table, document)
        };
    }

    private async connectDB(): Promise<Db> {
        if (!this.client) {
            this.client = await MongoClient.connect(this.mongoConnectionUrl);
        }
        if (!this.db) {
            this.db = this.client.db(this.mongoDBName);
        }
        return this.db;
    }

    private disconnectDB(): void {
        if (this.db) {
            this.db = undefined;
        }
        if (this.client) {
            this.client.close();
            this.client = undefined;
        }
    }

    private checkValid(): void {
        if (!this.isValid) {
            throw new Error("The specified database is not valid. Ensure the correct configurations have been specified.");
        }
    }

    private async deleteAll(table: string): Promise<void> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            const collections = await db.collections();
            if (collections.find(c => c.collectionName === table)) {
                await db.dropCollection(table);
            }
        } catch (error) {
            log.error(error);
            throw new Error("Cannot delete all the records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async deleteSingle(table: string, id: ObjectId): Promise<void> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            await db.collection(table).deleteOne({ _id: id });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot delete the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async getAll<T>(table: string): Promise<T[]> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            const cursor = await db.collection(table).find<T>({ });
            return await cursor.toArray();
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read all the records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async getAllFiltered<T>(table: string, filter: T): Promise<T[]> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            const cursor = await db.collection(table).find<T>(filter);
            return await cursor.toArray();
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the filtered records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async getSingle<T>(table: string, id: ObjectId): Promise<T> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            return await db.collection(table).findOne<T>({ _id: id });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot read the record with the specified ID. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async getSingleFiltered<T>(table: string, filter: T): Promise<T> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            return await db.collection(table).findOne<T>(filter);
        } catch (error) {
            throw error;
        }
    }

    private async insertSingle<T extends { _id?: ObjectId }>(table: string, item: T): Promise<T> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            delete item._id;
            const result = await db.collection(table).insertOne(item);
            item._id = result.insertedId;
            return item;
        } catch (error) {
            log.error(error);
            throw new Error("Cannot create the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async insertMany<T extends { _id?: ObjectId }>(table: string, items: IterableIterator<T>): Promise<T[]> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            const newItems: T[] = [];
            for (const item of items) {
                delete item._id;
                newItems.push(item);
            }
            const result = await db.collection(table).insertMany(newItems);
            for (let i = 0; i < newItems.length; i++) {
                const newItem = newItems[i];
                newItem._id = result.insertedIds[i];
            }
            return newItems;
        } catch (error) {
            log.error(error);
            throw new Error("Cannot create the specified records. Ensure the database is running and the correct database parameters have been specified.");
        }
    }

    private async updateSingle<T extends { _id?: ObjectId }>(table: string, item: T): Promise<void> {
        this.checkValid();
        try {
            const db = await this.connectDB();
            await db.collection(table).findOneAndUpdate({ _id: item._id }, { $set: item });
        } catch (error) {
            log.error(error);
            throw new Error("Cannot update the specified record. Ensure the database is running and the correct database parameters have been specified.");
        }
    }
}
