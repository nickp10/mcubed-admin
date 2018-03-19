import { Component } from "react";
import { IAlternateName } from "../../../interfaces";
import * as moment from "moment";
import * as React from "react";
import * as styles from "./alternateNamesList.css";

export interface AlternateNamesListProps {
}

export interface AlternateNamesListState {
    alternateNames?: IAlternateName[];
    error?: string;
    isLoaded?: boolean;
}

export default class AlternateNamesListComponent extends Component<AlternateNamesListProps, AlternateNamesListState> {
    constructor(props: AlternateNamesListProps, context?: any) {
        super(props, context);
        this.state = {
            alternateNames: []
        };
    }

    formatDateHTML(alternateName: IAlternateName) {
        let date = "N/A";
        if (alternateName.lastUsedDate) {
             date = moment(alternateName.lastUsedDate).format("MM/DD/YYYY hh:mm:ss A");
        }
        return {
            __html: date.replace(/\s/g, "&nbsp;")
        };
    }

    async componentDidMount() {
        try {
            const res = await fetch("/lineup/alternateNames/list/json");
            const alternateNames = await res.json();
            this.setState({
                alternateNames: alternateNames,
                isLoaded: true
            });
        } catch (error) {
            this.setState({
                error: error.message
            });
        }
    }

    render() {
        const { alternateNames, error, isLoaded } = this.state;
        if (error) {
            return (<div>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
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
                            <td>{alternateName.externalName || "N/A"}</td>
                            <td>{alternateName.contestName || "N/A"}</td>
                            <td dangerouslySetInnerHTML={this.formatDateHTML(alternateName)}></td>
                            <td>
                                <a className={styles.link} href={"/lineup/alternateNames/edit?id=" + alternateName.id}>Edit</a>&nbsp;
                                <a className={styles.link} href={"/lineup/alternateNames/delete?id=" + alternateName.id}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <th colSpan={4} className={styles.center}>
                            <a className={styles.link} href="/lineup/alternateNames/edit">Add</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
