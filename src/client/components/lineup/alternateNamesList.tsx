import { Component } from "react";
import { IAlternateName } from "../../../interfaces";
import * as moment from "moment";
import * as React from "react";
import * as sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface AlternateNamesListProps {
}

export interface AlternateNamesListState {
    alternateNames?: IAlternateName[];
    error?: string;
    isLoaded?: boolean;
    sortAscending?: boolean;
    sortProperty?: string;
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

    sortAlternateNames(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                alternateNames: previousState.alternateNames,
                sortAscending: sortAscending,
                sortProperty: sortProperty,
                isLoaded: previousState.isLoaded
            };
        });
    }

    async componentDidMount() {
        try {
            const res = await fetch("/lineup/alternateNames/list/json");
            const alternateNames = await res.json();
            this.setState((previousState, props) => {
                return {
                    alternateNames: alternateNames,
                    sortAscending: previousState.sortAscending,
                    sortProperty: previousState.sortProperty,
                    isLoaded: true
                };
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
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                    <tr>
                        <th className={sharedStyles.center}><SortHeader propertyName="externalName" display="External Name" state={this.state} onSort={this.sortAlternateNames.bind(this)} /></th>
                        <th className={sharedStyles.center}><SortHeader propertyName="contestName" display="Contest Name" state={this.state} onSort={this.sortAlternateNames.bind(this)} /></th>
                        <th className={sharedStyles.center}><SortHeader propertyName="lastUsedDate" display="Last Used Date" state={this.state} onSort={this.sortAlternateNames.bind(this)} /></th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {alternateNames.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(alternateName => (
                        <tr className={sharedStyles.highlight}>
                            <td>{alternateName.externalName || "N/A"}</td>
                            <td>{alternateName.contestName || "N/A"}</td>
                            <td dangerouslySetInnerHTML={this.formatDateHTML(alternateName)}></td>
                            <td>
                                <a className={sharedStyles.link} href={"/lineup/alternateNames/edit?id=" + alternateName.id}>Edit</a>&nbsp;
                                <a className={sharedStyles.link} href={"/lineup/alternateNames/delete?id=" + alternateName.id}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <th colSpan={4} className={sharedStyles.center}>
                            <a className={sharedStyles.link} href="/lineup/alternateNames/edit">Add</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
