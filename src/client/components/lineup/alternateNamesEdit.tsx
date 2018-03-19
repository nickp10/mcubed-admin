import { Component } from "react";
import { IAlternateName } from "../../../interfaces";
import { RouteProps } from "react-router-dom";
import * as moment from "moment";
import * as qs from "querystring";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface AlternateNamesEditProps extends RouteProps {
}

export interface AlternateNamesEditState {
    alternateName?: IAlternateName;
    alternateNameId?: string;
    externalName?: string;
    error?: string;
    isLoaded?: boolean;
}

export default class AlternateNamesEditComponent extends Component<AlternateNamesEditProps, AlternateNamesEditState> {
    constructor(props: AlternateNamesEditProps, context?: any) {
        super(props, context);
        const search = this.props.location.search;
        const query = qs.parse(search && search.startsWith("?") ? search.substr(1) : search);
        this.state = {
            alternateNameId: this.getQueryStringValue(query, "id"),
            externalName: this.getQueryStringValue(query, "externalName")
        };
    }

    getQueryStringValue(query: qs.ParsedUrlQuery,  key: string): string {
        const value = query[key];
        return Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;
    }

    useAlternateName(alternateName: IAlternateName): void {
        this.setState((previousState, props) => {
            return {
                alternateName: alternateName,
                alternateNameId: previousState.alternateNameId,
                externalName: previousState.externalName,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.state.alternateNameId) {
                const res = await fetch(`/lineup/alternateNames/get/json?id=${this.state.alternateNameId}`);
                const alternateName = await res.json();
                this.useAlternateName(alternateName);
            } else {
                this.useAlternateName({
                    externalName: this.state.externalName
                });
            }
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    alternateNameId: previousState.alternateNameId,
                    externalName: previousState.externalName,
                    error: error.message
                };
            });
        }
    }

    render() {
        const { alternateName, error, isLoaded } = this.state;
        if (error) {
            return (<div>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <form action="/lineup/alternateNames/edit" method="POST">
                    <input type="hidden" name="id" value={alternateName.id} />
                    <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>{alternateName.id ? "Edit" : "Add"} Lineup Alternate Name</th>
                        </tr>
                        <tr>
                            <td>
                                <strong>External Name:</strong><br /><br />
                                The name of the player that is retrieved from an external source (e.g., RotoWire, NumberFire, etc.).
                            </td>
                            <td>
                                <input type="text" name="externalName" autoFocus={!!alternateName.id || !alternateName.externalName} defaultValue={alternateName.externalName} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Contest Name:</strong><br /><br />
                                The name of the player that is retrieved from the contest source (e.g., FanDuel, DraftKings, etc.).
                            </td>
                            <td>
                                <input type="text" name="contestName" autoFocus={!alternateName.id && !!alternateName.externalName} defaultValue={alternateName.contestName} />
                            </td>
                        </tr>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>
                                <input type="submit" value="Save" />
                            </th>
                        </tr>
                    </table>
                </form>
            );
        }
    }
}
