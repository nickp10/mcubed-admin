import args from "./args";
import * as express from "express";
import log from "./log";
import * as process from "process";
import Persistence from "./persistence";

export default class App {
    persistence: Persistence;

    constructor() {
        this.persistence = new Persistence(args.persistenceServer, args.persistencePort, args.persistenceAppName, args.persistenceAppKey);
    }

    startServer() {
        const app = express();
        app.use(express.static(__dirname));
        app.get("/LineupAlternateNames", async (req, res) => await this.getLineupAlternateNames(req, res));
        app.listen(args.port, () => {
            log.info(`Server has started on port ${args.port}`);
        });
    }

    async getLineupAlternateNames(req: express.Request, res: express.Response): Promise<void> {
        try {
            const alternateNames = await this.persistence.getAlternateNames();
            res.status(200).send(alternateNames);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}
