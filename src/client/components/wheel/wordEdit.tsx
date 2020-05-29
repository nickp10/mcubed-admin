import { Component } from "react";
import { IWheelWord } from "../../../interfaces";
import { ObjectID } from "bson";
import { RouteComponentProps } from "react-router-dom";
import { idToString}  from "../../../objectIDUtils";
import * as qs from "querystring";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface WordEditProps {
    categoryID: string;
}

export interface WordEditState {
    error?: string;
    isLoaded?: boolean;
    word?: IWheelWord;
    wordID?: string;
}

export default class WordEditComponent extends Component<RouteComponentProps<WordEditProps>, WordEditState> {
    constructor(props: RouteComponentProps<WordEditProps>, context?: any) {
        super(props, context);
        const search = this.props.location.search;
        const query = qs.parse(search && search.startsWith("?") ? search.substr(1) : search);
        this.state = {
            wordID: this.getQueryStringValue(query, "id")
        };
    }

    getQueryStringValue(query: qs.ParsedUrlQuery,  key: string): string {
        const value = query[key];
        return Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;
    }

    useWord(word: IWheelWord): void {
        this.setState((previousState, props) => {
            return {
                word: word,
                wordID: previousState.wordID,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.state.wordID) {
                const res = await fetch(`/wheel/words/get/json?id=${this.state.wordID}`, {
                    credentials: "same-origin"
                });
                if (res.status !== 200) {
                    const error = await res.json();
                    throw error;
                }
                const word = await res.json();
                this.useWord(word);
            } else {
                this.useWord({
                    categoryID: new ObjectID(this.props.match.params.categoryID)
                });
            }
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    wordID: previousState.wordID,
                    error: error.message
                };
            });
        }
    }

    render() {
        const { word, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <form action={`/wheel/categories/${idToString(word.categoryID)}/words/edit`} method="POST">
                    <input type="hidden" name="id" value={idToString(word._id)} />
                    <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>{word._id ? "Edit" : "Add"} Word</th>
                        </tr>
                        <tr>
                            <td>
                                <strong>Word:</strong><br /><br />
                                The word to use for the puzzle.
                            </td>
                            <td>
                                <input type="text" name="word" autoFocus={true} defaultValue={word.word} />
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
