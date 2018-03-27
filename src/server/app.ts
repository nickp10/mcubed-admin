import { IAlternateName, IWheelCategory, IWheelWord } from "../interfaces";
import args from "./args";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as jwt from "jwt-express";
import log from "./log";
import * as path from "path";
import * as process from "process";
import Persistence from "./persistence";
import * as uuid4 from "uuid/v4";

export default class App {
    persistence: Persistence;
    static password = "test";

    constructor() {
        this.persistence = new Persistence(args.persistenceServer, args.persistencePort, args.persistenceAppName, args.persistenceAppKey);
    }

    startServer() {
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
        if (jwt && jwt.valid && jwt.payload.isAdmin) {
            res.redirect("/lineup/alternateNames/list");
        } else {
            res.redirect("/login");
        }
    }

    async serveReactClientApp(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const reactClient = path.join(__dirname, "index.html");
        res.sendFile(reactClient);
    }

    async login(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            if (req.body.password === App.password) {
                res.jwt({
                    isAdmin: true
                });
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
            const { id, contestName, externalName } = req.body;
            const alternateName: IAlternateName = {
                id: id,
                externalName: externalName,
                contestName: contestName
            };
            if (alternateName.id) {
                await this.persistence.putAlternateName(alternateName);
            } else {
                await this.persistence.postAlternateName(alternateName);
            }
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            next(error);
        }
    }

    async deleteLineupAlternateName(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            await this.persistence.deleteAlternateName(req.query.id);
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            next(error);
        }
    }

    async getLineupAlternateName(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const alternateName = await this.persistence.getAlternateName(req.query.id);
            res.status(200).send(alternateName);
        } catch (error) {
            next(error);
        }
    }

    async getLineupAlternateNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const alternateNames = await this.persistence.getAlternateNames();
            res.status(200).send(alternateNames);
        } catch (error) {
            next(error);
        }
    }

    async deleteLineupMissingNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const { id } = req.query;
            if (id) {
                await this.persistence.deleteMissingName(id);
            } else {
                await this.persistence.deleteMissingNames();
            }
            res.redirect("/lineup/missingNames/list");
        } catch (error) {
            next(error);
        }
    }

    async getLineupMissingNames(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const missingNames = await this.persistence.getMissingNames();
            res.status(200).send(missingNames);
        } catch (error) {
            next(error);
        }
    }

    async getWheelCategories(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelCategories = await this.persistence.getWheelCategories();
            res.status(200).send(wheelCategories);
        } catch (error) {
            next(error);
        }
    }

    async getWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelCategory = await this.persistence.getWheelCategory(req.query.id);
            res.status(200).send(wheelCategory);
        } catch (error) {
            next(error);
        }
    }

    async deleteWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            await this.persistence.deleteWheelCategory(req.query.id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async editWheelCategory(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const { id, name } = req.body;
            const wheelCategory: IWheelCategory = {
                id: id,
                name: name
            };
            if (wheelCategory.id) {
                await this.persistence.putWheelCategory(wheelCategory);
            } else {
                await this.persistence.postWheelCategory(wheelCategory);
            }
            res.redirect("/wheel/categories/list");
        } catch (error) {
            next(error);
        }
    }

    async getWheelWords(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelWords = await this.persistence.getWheelWords();
            res.status(200).send(wheelWords);
        } catch (error) {
            next(error);
        }
    }

    async getWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const wheelWord = await this.persistence.getWheelWord(req.query.id);
            res.status(200).send(wheelWord);
        } catch (error) {
            next(error);
        }
    }

    async deleteWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            await this.persistence.deleteWheelWord(req.query.id);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    async editWheelWord(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const { categoryID } = req.params;
            const { id, word } = req.body;
            const wheelWord: IWheelWord = {
                id: id,
                categoryID: categoryID,
                word: word
            };
            if (wheelWord.id) {
                await this.persistence.putWheelWord(wheelWord);
            } else {
                wheelWord.approved = false;
                await this.persistence.postWheelWord(wheelWord);
            }
            res.redirect(`/wheel/categories/${categoryID}/list`);
        } catch (error) {
            next(error);
        }
    }

    async approveManyWheelWords(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        try {
            const { ids } = req.body;
            const wordIDs = ids.split(",");
            for (const wordID of wordIDs) {
                await this.persistence.putWheelWord({
                    approved: true,
                    id: wordID
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
