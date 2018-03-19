import args from "./args";
import * as bodyParser from "body-parser";
import * as express from "express";
import log from "./log";
import * as path from "path";
import * as process from "process";
import Persistence from "./persistence";
import { IAlternateName } from "../interfaces";

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
        app.listen(args.port, () => {
            log.info(`Server has started on port ${args.port}`);
        });
    }

    async serveReactClientApp(req: express.Request, res: express.Response): Promise<void> {
        const reactClient = path.join(__dirname, "index.html");
        res.sendFile(reactClient);
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
            const { id } = req.query;
            await this.persistence.deleteAlternateName(id);
            res.redirect("/lineup/alternateNames/list");
        } catch (error) {
            res.status(500).send(error);
        }
    }
}
