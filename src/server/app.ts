import { IAlternateName, IClientAppState, IUser, IWheelCategory, IWheelWord } from "../interfaces";
import args from "./args";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import * as jwt from "jwt-express";
import { idToString, idToObjectID}  from "../objectIDUtils";
import log from "./log";
import Persistence from "./persistence";
import template from "./template";
import utils from "../utils";
import { v4 as uuid4 } from "uuid";

export default class App {
    persistence: Persistence;
    static adminUsername = "admin";

    constructor() {
        this.persistence = new Persistence(args.mongoConnectionUrl, args.mongoDBName);
    }

    async startServer(): Promise<void> {
        const app = express();
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(cookieParser());
        // Use a random string as the secret for the JWTs. This means JWTs will not
        // survive application restarts, but improves the security. The secret is
        // unknown until runtime and is harder to spoof a new JWT.
        app.use(jwt.init(uuid4(), {
            signOptions: {
                expiresIn: "1h"
            },
            verifyOptions: {
                ignoreExpiration: false
            }
        }));
        app.get("/", async (req, res, next) => await this.serveHome(req, res, next));
        app.use(express.static(__dirname));
        app.get("/login", async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/login/json", async (req, res, next) => await this.login(req, res, next));
        app.get("/logout", async (req, res, next) => await this.logout(req, res, next));
        app.get("/changePassword", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/changePassword/json", jwt.active(), async (req, res, next) => await this.changePassword(req, res, next));
        app.post("/createPassword/json", async (req, res, next) => await this.createPassword(req, res, next));
        app.get("/lineup/alternateNames/delete", jwt.active(), async (req, res, next) => await this.deleteLineupAlternateName(req, res, next));
        app.get("/lineup/alternateNames/edit", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/lineup/alternateNames/edit", jwt.active(), async (req, res, next) => await this.editLineupAlternateName(req, res, next));
        app.get("/lineup/alternateNames/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.get("/lineup/alternateNames/list/json", jwt.active(), async (req, res, next) => await this.getLineupAlternateNames(req, res, next));
        app.get("/lineup/alternateNames/get/json", jwt.active(), async (req, res, next) => await this.getLineupAlternateName(req, res, next));
        app.get("/lineup/missingNames/delete", jwt.active(), async (req, res, next) => await this.deleteLineupMissingNames(req, res, next));
        app.get("/lineup/missingNames/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.get("/lineup/missingNames/list/json", jwt.active(), async (req, res, next) => await this.getLineupMissingNames(req, res, next));
        app.get("/wheel/categories/:categoryID/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.get("/wheel/categories/:categoryID/words/edit", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/wheel/categories/:categoryID/words/edit", jwt.active(), async (req, res, next) => await this.editWheelWord(req, res, next));
        app.get("/wheel/categories/delete/json", jwt.active(), async (req, res, next) => await this.deleteWheelCategory(req, res, next));
        app.get("/wheel/categories/edit", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/wheel/categories/edit", jwt.active(), async (req, res, next) => await this.editWheelCategory(req, res, next));
        app.get("/wheel/categories/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.get("/wheel/categories/list/json", jwt.active(), async (req, res, next) => await this.getWheelCategories(req, res, next));
        app.get("/wheel/categories/get/json", jwt.active(), async (req, res, next) => await this.getWheelCategory(req, res, next));
        app.get("/wheel/duplicates/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.get("/wheel/unverified/list", jwt.active(), async (req, res, next) => await this.serveReactClientApp(req, res, next));
        app.post("/wheel/words/approveMany/json", jwt.active(), async (req, res, next) => await this.approveManyWheelWords(req, res, next));
        app.get("/wheel/words/list/json", jwt.active(), async (req, res, next) => await this.getWheelWords(req, res, next));
        app.get("/wheel/words/get/json", jwt.active(), async (req, res, next) => await this.getWheelWord(req, res, next));
        app.get("/wheel/words/delete/json", jwt.active(), async (req, res, next) => await this.deleteWheelWord(req, res, next));
        app.use(async (err, req, res, next) => await this.handleError(err, req, res, next));
        app.listen(args.port, () => {
            log.info(`Server has started on port ${args.port}`);
        });
    }

    async serveHome(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const jwt = req.jwt;
        if (jwt && jwt.valid) {
            res.redirect("/lineup/alternateNames/list");
        } else {
            res.redirect("/login");
        }
    }

    getJWTPayload(jwt: jwt.JWT): IClientAppState {
        if (!jwt || !jwt.valid) {
            return undefined;
        }
        return jwt.payload;
    }

    generateJWTPayload(adminUser: IUser, isLoggedIn: boolean): IClientAppState {
        return {
            hasAdminAccount: !!adminUser,
            isLoggedIn: isLoggedIn,
            serverError: undefined
        };
    }

    async generateDefaultClientAppState(): Promise<IClientAppState> {
        try {
            const adminUser = await this.persistence.users.getSingleFiltered({ username: App.adminUsername });
            return {
                hasAdminAccount: !!adminUser,
                isLoggedIn: false,
                serverError: undefined
            };
        } catch (error) {
            return {
                hasAdminAccount: false,
                isLoggedIn: false,
                serverError: error.message
            };
        }
    }

    async serveReactClientApp(req: express.Request, res: express.Response, next: express.NextFunction, title?: string): Promise<void> {
        const clientAppState = this.getJWTPayload(req.jwt) || await this.generateDefaultClientAppState();
        res.status(200).send(template(title, clientAppState));
    }

    async changePassword(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            if (!req.body.password || !req.body.confirmPassword) {
                throw { status: 401, message: "Cannot update the admin user without a password." };
            }
            if (req.body.password !== req.body.confirmPassword) {
                throw { status: 400, message: "Password and confirm password must match." };
            }
            let adminUser = await this.persistence.users.getSingleFiltered({ username: App.adminUsername});
            if (!adminUser) {
                throw { message: "The admin user has not been setup. Consider using the create password page to setup the admin user." };
            }
            if (adminUser.password !== utils.hashPassword(req.body.currentPassword)) {
                throw { status: 401, message: "Invalid current password was entered." };
            }
            adminUser.password = utils.hashPassword(req.body.password);
            await this.persistence.users.updateSingle(adminUser);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async createPassword(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            if (!req.body.password || !req.body.confirmPassword) {
                throw { status: 401, message: "Cannot create an admin user without a password." };
            }
            if (req.body.password !== req.body.confirmPassword) {
                throw { status: 400, message: "Password and confirm password must match." };
            }
            let adminUser = await this.persistence.users.getSingleFiltered({ username: App.adminUsername });
            if (adminUser) {
                throw { message: "The admin user has already been setup. Consider using the change password page to update the password." };
            }
            adminUser = {
                username: App.adminUsername,
                password: utils.hashPassword(req.body.password)
            };
            adminUser = await this.persistence.users.insertSingle(adminUser);
            res.jwt(this.generateJWTPayload(adminUser, true));
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async login(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const adminUser = await this.persistence.users.getSingleFiltered({ username: App.adminUsername });
            if (adminUser && utils.hashPassword(req.body.password) === adminUser.password) {
                res.jwt(this.generateJWTPayload(adminUser, true));
                res.sendStatus(200);
            } else {
                throw { status: 401, message: "Unable to login" };
            }
        } catch (error) {
            next(error);
        }
    }

    async logout(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        jwt.clear();
        res.redirect("/");
    }

    async editLineupAlternateName(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(req.body.id);
            const { contestName, externalName } = req.body;
            const alternateName: IAlternateName = {
                _id: id,
                externalName: externalName,
                contestName: contestName
            };
            if (alternateName._id) {
                await this.persistence.lineupalternatenames.updateSingle(alternateName);
            } else {
                await this.persistence.lineupalternatenames.insertSingle(alternateName);
            }
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            next(error);
        }
    }

    async deleteLineupAlternateName(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            await this.persistence.lineupalternatenames.deleteSingle(id);
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            next(error);
        }
    }

    async getLineupAlternateName(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            const alternateName = await this.persistence.lineupalternatenames.getSingle(id);
            res.status(200).send(alternateName);
        } catch (error) {
            next(error);
        }
    }

    async getLineupAlternateNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const alternateNames = await this.persistence.lineupalternatenames.getAll();
            res.status(200).send(alternateNames);
        } catch (error) {
            next(error);
        }
    }

    async deleteLineupMissingNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            if (id) {
                await this.persistence.lineupmissingnames.deleteSingle(id);
            } else {
                await this.persistence.lineupmissingnames.deleteAll();
            }
            res.redirect("/lineup/missingNames/list");
        } catch (error) {
            next(error);
        }
    }

    async getLineupMissingNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const missingNames = await this.persistence.lineupmissingnames.getAll();
            res.status(200).send(missingNames);
        } catch (error) {
            next(error);
        }
    }

    async getWheelCategories(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelCategories = await this.persistence.wheelcategories.getAll();
            res.status(200).send(wheelCategories);
        } catch (error) {
            next(error);
        }
    }

    async getWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            const wheelCategory = await this.persistence.wheelcategories.getSingle(id);
            res.status(200).send(wheelCategory);
        } catch (error) {
            next(error);
        }
    }

    async deleteWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            await this.persistence.wheelcategories.deleteSingle(id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async editWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(req.body.id);
            const { name } = req.body;
            const wheelCategory: IWheelCategory = {
                _id: id,
                name: name
            };
            if (wheelCategory._id) {
                await this.persistence.wheelcategories.updateSingle(wheelCategory);
            } else {
                await this.persistence.wheelcategories.insertSingle(wheelCategory);
            }
            res.redirect("/wheel/categories/list");
        } catch (error) {
            next(error);
        }
    }

    async getWheelWords(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelWords = await this.persistence.wheelwords.getAll();
            res.status(200).send(wheelWords);
        } catch (error) {
            next(error);
        }
    }

    async getWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            const wheelWord = await this.persistence.wheelwords.getSingle(id);
            res.status(200).send(wheelWord);
        } catch (error) {
            next(error);
        }
    }

    async deleteWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const id = idToObjectID(<string>req.query.id);
            await this.persistence.wheelwords.deleteSingle(id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async editWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const categoryID = idToObjectID(req.params.categoryID);
            const id = idToObjectID(req.body.id);
            const { word } = req.body;
            const wheelWord: IWheelWord = {
                _id: id,
                categoryID: categoryID,
                word: word
            };
            if (wheelWord._id) {
                await this.persistence.wheelwords.updateSingle(wheelWord);
            } else {
                wheelWord.approved = false;
                await this.persistence.wheelwords.insertSingle(wheelWord);
            }
            res.redirect(`/wheel/categories/${idToString(categoryID)}/list`);
        } catch (error) {
            next(error);
        }
    }

    async approveManyWheelWords(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const { ids } = req.body;
            const wordIDs = ids.split(",");
            for (const wordID of wordIDs) {
                await this.persistence.wheelwords.updateSingle({
                    approved: true,
                    _id: idToObjectID(wordID)
                });
            }
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async handleError(err: any, req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        if (err.name === "JWTExpressError") {
            res.redirect("/login");
            return;
        }
        if (typeof err.status === "number") {
            res.status(err.status);
        } else {
            res.status(500);
        }
        if (typeof err === "string") {
            err = { message: err };
        } else if (err instanceof Error) {
            err = { message: err.message };
        } else if (typeof err.message === "string") {
            err = { message: err.message };
        }
        res.json(err);
    }
}
