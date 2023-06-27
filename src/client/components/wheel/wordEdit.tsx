import { Component } from "react";
import { IWheelWord } from "../../../interfaces";
import { idToString, idToObjectID }  from "../../../objectIDUtils";
import * as React from "react";
import sharedStyles from "../shared.css";

export interface WordEditProps {
    categoryID: string;
    wordID: string;
}

export interface WordEditState {
    error?: string;
    isLoaded?: boolean;
    word?: IWheelWord
}

export default class WordEditComponent extends Component<WordEditProps, WordEditState> {
    constructor(props: WordEditProps) {
        super(props);
        this.state = { };
    }

    useWord(word: IWheelWord): void {
        this.setState((previousState, props) => {
            return {
                word: word,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.props.wordID) {
                const res = await fetch(`/wheel/words/get/json?id=${this.props.wordID}`, {
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
                    categoryID: idToObjectID(this.props.categoryID)
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
