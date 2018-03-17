import { Component } from "react";
import { IAlternateName } from "../../interfaces";
import * as moment from "moment";
import * as React from "react";
import * as styles from "./app.css";

export interface AppProps {
}

export interface AppState {
    alternateNames: IAlternateName[];
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps, context?: any) {
        super(props, context);
        this.state = {
            alternateNames: [
                {
                    id: "1",
                    contestName: "Joe",
                    externalName: "Joey",
                    lastUsedDate: new Date()
                },
                {
                    id: "2",
                    contestName: "Bob",
                    externalName: "William",
                    lastUsedDate: new Date()
                }
            ]
        };
    }

    formatDateHTML(alternateName: IAlternateName) {
        let date = "N/A";
        if (alternateName.lastUsedDate) {
             date = moment(alternateName.lastUsedDate).format("MM/DD/YYYY hh:mm:ssA");
        }
        return {
            __html: date.replace(/\s/g, "&nbsp;")
        };
    }

    render() {
        const { alternateNames } = this.state;
        return (
            <table className={`${styles.content} ${styles.w75}`}>
                <tr>
                    <th className={styles.center}>External Name</th>
                    <th className={styles.center}>Contest Name</th>
                    <th className={styles.center}>Last Used</th>
                    <th className={styles.center}>Actions</th>
                </tr>
                {alternateNames.map(alternateName => (
                    <tr className={styles.highlight}>
                        <td>{alternateName.externalName || 'N/A'}</td>
                        <td>{alternateName.contestName || 'N/A'}</td>
                        <td dangerouslySetInnerHTML={this.formatDateHTML(alternateName)}></td>
                        <td>
                            <a className={styles.link} href={"/EditLineupAlternateName?id=" + alternateName.id}>Edit</a>&nbsp;
                            <a className={styles.link} href={"/DeleteLineupAlternateName?id=" + alternateName.id}>Delete</a>
                        </td>
                    </tr>
                ))}
                <tr>
                    <th colSpan={4} className="center">
                        <a className={styles.link} href="/EditLineupAlternateName">Add</a>
                    </th>
                </tr>
            </table>
        );
    }
}
