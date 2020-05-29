import { Component } from "react";
import { IWheelWord } from "../../../interfaces";
import { ObjectID } from "bson";
import { RouteComponentProps } from "react-router-dom";
import { idToString, idEquals}  from "../../../objectIDUtils";
import * as React from "react";
import * as sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface CategoryWordListProps {
    categoryID: string;
}

export interface CategoryWordListState {
    error?: string;
    isLoaded?: boolean;
    words?: IWheelWord[];
    sortAscending?: boolean;
    sortProperty?: string;
}

export default class CategoriesListComponent extends Component<RouteComponentProps<CategoryWordListProps>, CategoryWordListState> {
    constructor(props: RouteComponentProps<CategoryWordListProps>, context?: any) {
        super(props, context);
        this.state = {
            words: [],
            sortAscending: true,
            sortProperty: "word"
        };
    }

    sortWords(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                words: previousState.words,
                sortAscending: sortAscending,
                sortProperty: sortProperty,
                isLoaded: previousState.isLoaded
            };
        });
    }

    async componentDidMount() {
        try {
            const res = await fetch(`/wheel/words/list/json`, {
                credentials: "same-origin"
            });
            if (res.status !== 200) {
                const error = await res.json();
                throw error;
            }
            const words: IWheelWord[] = await res.json();
            this.setState((previousState, props) => {
                return {
                    words: words.filter(w => idEquals(w.categoryID, this.props.match.params.categoryID)),
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

    async deleteWord(word: IWheelWord): Promise<void> {
        try {
            const res = await fetch(`/wheel/words/delete/json?id=${idToString(word._id)}`, {
                credentials: "same-origin"
            });
            if (res.status !== 200) {
                const error = await res.json();
                throw error;
            }
            this.setState((previousState, props) => {
                return {
                    words: previousState.words.filter(w => !idEquals(w._id, word._id)),
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
        const { words, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                    <tr>
                        <th className={sharedStyles.center}><SortHeader propertyName="word" display="Word" state={this.state} onSort={this.sortWords.bind(this)} /></th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {words.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(word => (
                        <tr className={sharedStyles.highlight}>
                            <td>{word.word || "N/A"}</td>
                            <td>
                                <a className={sharedStyles.link} href={`/wheel/categories/${idToString(word.categoryID)}/words/edit?id=${idToString(word._id)}`}>Edit</a>&nbsp;
                                <a className={sharedStyles.link} onClick={this.deleteWord.bind(this, word)}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    {words.length === 0 &&
                        <tr>
                            <td colSpan={2}>There are no words in this category.</td>
                        </tr>
                    }
                    <tr>
                        <th colSpan={2} className={sharedStyles.center}>
                            <a className={sharedStyles.link} href={`/wheel/categories/${idToString(this.props.match.params.categoryID)}/words/edit`}>Add</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
