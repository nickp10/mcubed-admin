import { Component } from "react";
import { IAlternateName } from "../../../interfaces";
import { idToString}  from "../../../objectIDUtils";
import * as React from "react";
import sharedStyles from "../shared.css";

export interface AlternateNamesEditProps {
    alternateNameID: string;
    externalName: string;
}

export interface AlternateNamesEditState {
    alternateName?: IAlternateName;
    error?: string;
    isLoaded?: boolean;
}

export default class AlternateNamesEditComponent extends Component<AlternateNamesEditProps, AlternateNamesEditState> {
    constructor(props: AlternateNamesEditProps) {
        super(props);
        this.state = { };
    }

    useAlternateName(alternateName: IAlternateName): void {
        this.setState((previousState, props) => {
            return {
                alternateName: alternateName,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.props.alternateNameID) {
                const res = await fetch(`/lineup/alternateNames/get/json?id=${this.props.alternateNameID}`, {
                    credentials: "same-origin"
                });
                if (res.status !== 200) {
                    const error = await res.json();
                    throw error;
                }
                const alternateName = await res.json();
                this.useAlternateName(alternateName);
            } else {
                this.useAlternateName({
                    externalName: this.props.externalName
                });
            }
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    error: error.message
                };
            });
        }
    }

    render() {
        const { alternateName, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <form action="/lineup/alternateNames/edit" method="POST">
                    <input type="hidden" name="id" value={idToString(alternateName._id)} />
                    <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>{alternateName._id ? "Edit" : "Add"} Lineup Alternate Name</th>
                        </tr>
                        <tr>
                            <td>
                                <strong>External Name:</strong><br /><br />
                                The name of the player that is retrieved from an external source (e.g., RotoWire, NumberFire, etc.).
                            </td>
                            <td>
                                <input type="text" name="externalName" autoFocus={!!alternateName._id || !alternateName.externalName} defaultValue={alternateName.externalName} />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <strong>Contest Name:</strong><br /><br />
                                The name of the player that is retrieved from the contest source (e.g., FanDuel, DraftKings, etc.).
                            </td>
                            <td>
                                <input type="text" name="contestName" autoFocus={!alternateName._id && !!alternateName.externalName} defaultValue={alternateName.contestName} />
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
