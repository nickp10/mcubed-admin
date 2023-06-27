import { Component } from "react";
import { IWheelCategory, IWheelWord } from "../../../interfaces";
import { idToString, idEquals}  from "../../../objectIDUtils";
import { ObjectId } from "bson";
import * as querystring from "querystring";
import * as React from "react";
import sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface UnverifiedWordsListProps {
}

export interface UnverifiedWordsListState {
    error?: string;
    isLoaded?: boolean;
    categories?: IWheelCategory[];
    unverifiedWords?: IWheelWord[];
    sortAscending?: boolean;
    sortProperty?: string;
}

export default class UnverifiedWordsListComponent extends Component<UnverifiedWordsListProps, UnverifiedWordsListState> {
    constructor(props: UnverifiedWordsListProps) {
        super(props);
        this.state = {
            categories: [],
            unverifiedWords: [],
            sortAscending: true,
            sortProperty: "word"
        };
    }

    sortWords(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                unverifiedWords: previousState.unverifiedWords,
                sortAscending: sortAscending,
                sortProperty: sortProperty,
                isLoaded: previousState.isLoaded
            };
        });
    }

    async componentDidMount() {
        try {
            const res1 = await fetch("/wheel/categories/list/json", {
                credentials: "same-origin"
            });
            if (res1.status !== 200) {
                const error = await res1.json();
                throw error;
            }
            const categories = await res1.json();
            const res2 = await fetch("/wheel/words/list/json", {
                credentials: "same-origin"
            });
            if (res2.status !== 200) {
                const error = await res2.json();
                throw error;
            }
            const words: IWheelWord[] = await res2.json();
            this.setState((previousState, props) => {
                return {
                    categories: categories,
                    unverifiedWords: words.filter(w => !w.approved),
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

    async approveAll(): Promise<void> {
        try {
            this.setState((previousState, props) => {
                return {
                    categories: previousState.categories,
                    unverifiedWords: previousState.unverifiedWords,
                    sortAscending: previousState.sortAscending,
                    sortProperty: previousState.sortProperty,
                    isLoaded: false
                };
            });
            const ids = this.state.unverifiedWords.map(w => idToString(w._id)).join(",");
            const res1 = await fetch("/wheel/words/approveMany/json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: querystring.stringify({
                    ids: ids
                }),
                credentials: "same-origin"
            });
            if (res1.status !== 200) {
                const error = await res1.json();
                throw error;
            }
            const res2 = await fetch("/wheel/words/list/json", {
                credentials: "same-origin"
            });
            if (res2.status !== 200) {
                const error = await res2.json();
                throw error;
            }
            const words: IWheelWord[] = await res2.json();
            this.setState((previousState, props) => {
                return {
                    categories: previousState.categories,
                    unverifiedWords: words.filter(w => !w.approved),
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
                    categories: previousState.categories,
                    unverifiedWords: previousState.unverifiedWords.filter(w => !idEquals(w._id, word._id)),
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

    formatCategoryName(id: ObjectId): string {
        const category = this.state.categories.find(c => idEquals(c._id, id));
        return category ? category.name : undefined;
    }

    render() {
        const { unverifiedWords, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                    <tr>
                        <th className={sharedStyles.center}><SortHeader propertyName="word" display="Word" state={this.state} onSort={this.sortWords.bind(this)} /></th>
                        <th className={sharedStyles.center}>Category</th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {unverifiedWords.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(unverifiedWord => (
                        <tr className={sharedStyles.highlight}>
                            <td>{unverifiedWord.word || "N/A"}</td>
                            <td>{this.formatCategoryName(unverifiedWord.categoryID) || "N/A"}</td>
                            <td>
                                <a className={sharedStyles.link} href={`/wheel/categories/${idToString(unverifiedWord.categoryID)}/words/edit?id=${idToString(unverifiedWord._id)}`}>Edit</a>&nbsp;
                                <a className={sharedStyles.link} onClick={this.deleteWord.bind(this, unverifiedWord)}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    {unverifiedWords.length === 0 &&
                        <tr>
                            <td colSpan={3}>There are no unverified words.</td>
                        </tr>
                    }
                    <tr>
                        <th colSpan={3} className={sharedStyles.center}>
                            <a className={sharedStyles.link} onClick={this.approveAll.bind(this)}>Approve All</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
