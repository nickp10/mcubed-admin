import { Component } from "react";
import { IWheelCategory, IWheelWord } from "../../../interfaces";
import { RouteComponentProps } from "react-router-dom";
import { idToString, idEquals}  from "../../../objectIDUtils";
import { ObjectID } from "bson";
import * as React from "react";
import * as sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface DuplicateWordsListProps {
}

export interface DuplicateWordsListState {
    error?: string;
    isLoaded?: boolean;
    categories?: IWheelCategory[];
    duplicateWords?: IWheelWord[];
    sortAscending?: boolean;
    sortProperty?: string;
}

export default class DuplicateWordsListComponent extends Component<RouteComponentProps<DuplicateWordsListProps>, DuplicateWordsListState> {
    constructor(props: RouteComponentProps<DuplicateWordsListProps>, context?: any) {
        super(props, context);
        this.state = {
            categories: [],
            duplicateWords: [],
            sortAscending: true,
            sortProperty: "word"
        };
    }

    sortWords(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                duplicateWords: previousState.duplicateWords,
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
                    duplicateWords: this.filterDuplicates(words),
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
                    duplicateWords: previousState.duplicateWords.filter(w => w.word !== word.word),
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

    filterDuplicates(words: IWheelWord[]): IWheelWord[] {
        const emptyWord: IWheelWord = {};
        const duplicates: IWheelWord[] = [];
        const seenWords = new Map<string, IWheelWord>();
        for (const word of words) {
            const key = word.word;
            if (seenWords.has(key)) {
                const firstDuplicate = seenWords.get(key);
                if (firstDuplicate !== emptyWord) {
                    duplicates.push(firstDuplicate);
                    seenWords.set(key, emptyWord);
                }
                duplicates.push(word);
            } else {
                seenWords.set(key, word);
            }
        }
        return duplicates;
    }

    formatCategoryName(id: ObjectID): string {
        const category = this.state.categories.find(c => idEquals(c._id, id));
        return category ? category.name : undefined;
    }

    render() {
        const { duplicateWords, error, isLoaded } = this.state;
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
                    {duplicateWords.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(duplicateWord => (
                        <tr className={sharedStyles.highlight}>
                            <td>{duplicateWord.word || "N/A"}</td>
                            <td>{this.formatCategoryName(duplicateWord.categoryID) || "N/A"}</td>
                            <td>
                                <a className={sharedStyles.link} href={`/wheel/categories/${idToString(duplicateWord.categoryID)}/words/edit?id=${idToString(duplicateWord._id)}`}>Edit</a>&nbsp;
                                <a className={sharedStyles.link} onClick={this.deleteWord.bind(this, duplicateWord)}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    {duplicateWords.length === 0 &&
                        <tr>
                            <td colSpan={3}>There are no duplicate words.</td>
                        </tr>
                    }
                </table>
            );
        }
    }
}
