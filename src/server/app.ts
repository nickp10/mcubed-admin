import { IAlternateName, IWheelCategory, IWheelWord } from "../interfaces";
import args from "./args";
import * as bodyParser from "body-parser";
import * as express from "express";
import log from "./log";
import * as path from "path";
import * as process from "process";
import Persistence from "./persistence";

export default class App {
    persistence: Persistence;

    constructor() {
        this.persistence = new Persistence(args.persistenceServer, args.persistencePort, args.persistenceAppName, args.persistenceAppKey);
    }

    startServer() {
        const app = express();
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(express.static(__dirname));
        app.get("/lineup/alternateNames/delete", async (req, res) => await this.deleteLineupAlternateName(req, res));
        app.get("/lineup/alternateNames/edit", async (req, res) => await this.serveReactClientApp(req, res));
        app.post("/lineup/alternateNames/edit", async (req, res) => await this.editLineupAlternateName(req, res));
        app.get("/lineup/alternateNames/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.get("/lineup/alternateNames/list/json", async (req, res) => await this.getLineupAlternateNames(req, res));
        app.get("/lineup/alternateNames/get/json", async (req, res) => await this.getLineupAlternateName(req, res));
        app.get("/lineup/missingNames/delete", async (req, res) => await this.deleteLineupMissingNames(req, res));
        app.get("/lineup/missingNames/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.get("/lineup/missingNames/list/json", async (req, res) => await this.getLineupMissingNames(req, res));
        app.get("/wheel/categories/:categoryID/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.get("/wheel/categories/:categoryID/words/edit", async (req, res) => await this.serveReactClientApp(req, res));
        app.post("/wheel/categories/:categoryID/words/edit", async (req, res) => await this.editWheelWord(req, res));
        app.get("/wheel/categories/delete/json", async (req, res) => await this.deleteWheelCategory(req, res));
        app.get("/wheel/categories/edit", async (req, res) => await this.serveReactClientApp(req, res));
        app.post("/wheel/categories/edit", async (req, res) => await this.editWheelCategory(req, res));
        app.get("/wheel/categories/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.get("/wheel/categories/list/json", async (req, res) => await this.getWheelCategories(req, res));
        app.get("/wheel/categories/get/json", async (req, res) => await this.getWheelCategory(req, res));
        app.get("/wheel/duplicates/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.get("/wheel/unverified/list", async (req, res) => await this.serveReactClientApp(req, res));
        app.post("/wheel/words/approveMany/json", async (req, res) => await this.approveManyWheelWords(req, res));
        app.get("/wheel/words/list/json", async (req, res) => await this.getWheelWords(req, res));
        app.get("/wheel/words/get/json", async (req, res) => await this.getWheelWord(req, res));
        app.get("/wheel/words/delete/json", async (req, res) => await this.deleteWheelWord(req, res));
        app.listen(args.port, () => {
            log.info(`Server has started on port ${args.port}`);
        });
    }

    async serveReactClientApp(req: express.Request, res: express.Response): Promise<void> {
        const reactClient = path.join(__dirname, "index.html");
        res.sendFile(reactClient);
    }

    async editLineupAlternateName(req: express.Request, res: express.Response): Promise<void> {
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
            res.status(500).send(error);
        }
    }

    async deleteLineupAlternateName(req: express.Request, res: express.Response): Promise<void> {
        try {
            await this.persistence.deleteAlternateName(req.query.id);
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getLineupAlternateName(req: express.Request, res: express.Response): Promise<void> {
        try {
            const alternateName = await this.persistence.getAlternateName(req.query.id);
            res.status(200).send(alternateName);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getLineupAlternateNames(req: express.Request, res: express.Response): Promise<void> {
        try {
            const alternateNames = await this.persistence.getAlternateNames();
            res.status(200).send(alternateNames);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async deleteLineupMissingNames(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { id } = req.query;
            if (id) {
                await this.persistence.deleteMissingName(id);
            } else {
                await this.persistence.deleteMissingNames();
            }
            res.redirect("/lineup/missingNames/list");
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getLineupMissingNames(req: express.Request, res: express.Response): Promise<void> {
        try {
            const missingNames = await this.persistence.getMissingNames();
            res.status(200).send(missingNames);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getWheelCategories(req: express.Request, res: express.Response): Promise<void> {
        try {
            const wheelCategories = await this.persistence.getWheelCategories();
            res.status(200).send(wheelCategories);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getWheelCategory(req: express.Request, res: express.Response): Promise<void> {
        try {
            const wheelCategory = await this.persistence.getWheelCategory(req.query.id);
            res.status(200).send(wheelCategory);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async deleteWheelCategory(req: express.Request, res: express.Response): Promise<void> {
        try {
            await this.persistence.deleteWheelCategory(req.query.id);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async editWheelCategory(req: express.Request, res: express.Response): Promise<void> {
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
            res.status(500).send(error);
        }
    }

    async getWheelWords(req: express.Request, res: express.Response): Promise<void> {
        try {
            const wheelWords = await this.persistence.getWheelWords();
            res.status(200).send(wheelWords);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async getWheelWord(req: express.Request, res: express.Response): Promise<void> {
        try {
            const wheelWord = await this.persistence.getWheelWord(req.query.id);
            res.status(200).send(wheelWord);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async deleteWheelWord(req: express.Request, res: express.Response): Promise<void> {
        try {
            await this.persistence.deleteWheelWord(req.query.id);
            res.sendStatus(200);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async editWheelWord(req: express.Request, res: express.Response): Promise<void> {
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
            res.status(500).send(error);
        }
    }

    async approveManyWheelWords(req: express.Request, res: express.Response): Promise<void> {
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
            res.status(500).send(error);
        }
    }
}
