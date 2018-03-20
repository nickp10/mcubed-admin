import { Component } from "react";
import { IMissingName, Sport } from "../../../interfaces";
import * as React from "react";
import * as sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface MissingNamesListProps {
}

export interface MissingNamesListState {
    error?: string;
    isLoaded?: boolean;
    missingNames?: IMissingName[];
    sortAscending?: boolean;
    sortProperty?: string;
}

export default class MissingNamesListComponent extends Component<MissingNamesListProps, MissingNamesListState> {
    constructor(props: MissingNamesListProps, context?: any) {
        super(props, context);
        this.state = {
            missingNames: []
        };
    }

    sortMissingNames(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                missingNames: previousState.missingNames,
                sortAscending: sortAscending,
                sortProperty: sortProperty,
                isLoaded: previousState.isLoaded
            };
        });
    }

    async componentDidMount() {
        try {
            const res = await fetch("/lineup/missingNames/list/json");
            const missingNames = await res.json();
            this.setState((previousState, props) => {
                return {
                    missingNames: missingNames,
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
        const { missingNames, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                    <tr>
                        <th className={sharedStyles.center}><SortHeader propertyName="name" display="Name" state={this.state} onSort={this.sortMissingNames.bind(this)} /></th>
                        <th className={sharedStyles.center}><SortHeader propertyName="team" display="Team" state={this.state} onSort={this.sortMissingNames.bind(this)} /></th>
                        <th className={sharedStyles.center}><SortHeader propertyName="sport" display="Sport" state={this.state} onSort={this.sortMissingNames.bind(this)} /></th>
                        <th className={sharedStyles.center}><SortHeader propertyName="count" display="Count" state={this.state} onSort={this.sortMissingNames.bind(this)} /></th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {missingNames.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(missingName => (
                        <tr className={sharedStyles.highlight}>
                            <td>{missingName.name || "N/A"}</td>
                            <td>{missingName.team}</td>
                            <td>{Sport[missingName.sport]}</td>
                            <td>{missingName.count}</td>
                            <td>
                                <a className={sharedStyles.link} href={"/lineup/alternateNames/edit?externalName=" + encodeURIComponent(missingName.name)}>Add</a>&nbsp;
                                <a className={sharedStyles.link} href={"/lineup/missingNames/delete?id=" + missingName.id}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    {missingNames.length === 0 &&
                        <tr>
                            <td colSpan={5}>There are no missing names.</td>
                        </tr>
                    }
                    <tr>
                        <th colSpan={5} className={sharedStyles.center}>
                            <a className={sharedStyles.link} href="/lineup/missingNames/delete">Delete All</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
