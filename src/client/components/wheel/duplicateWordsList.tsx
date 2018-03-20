import { Component } from "react";
import { IWheelCategory, IWheelWord } from "../../../interfaces";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface DuplicateWordsListProps {
}

export interface DuplicateWordsListState {
    error?: string;
    isLoaded?: boolean;
    categories?: IWheelCategory[];
    duplicateWords?: IWheelWord[];
}

export default class DuplicateWordsListComponent extends Component<DuplicateWordsListProps, DuplicateWordsListState> {
    constructor(props: DuplicateWordsListProps, context?: any) {
        super(props, context);
        this.state = {
            categories: [],
            duplicateWords: []
        };
    }

    async componentDidMount() {
        try {
            const res1 = await fetch("/wheel/categories/list/json");
            const categories = await res1.json();
            const res2 = await fetch("/wheel/words/list/json");
            const words: IWheelWord[] = await res2.json();
            this.setState((previousState, props) => {
                return {
                    categories: categories,
                    duplicateWords: this.filterDuplicates(words),
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
            const res = await fetch(`/wheel/words/delete/json?id=${word.id}`);
            if (res.status === 200) {
                this.setState((previousState, props) => {
                    return {
                        categories: previousState.categories,
                        duplicateWords: previousState.duplicateWords.filter(w => w.word !== word.word),
                        isLoaded: true
                    };
                });
            } else {
                this.setState({
                    error: `Could not delete the word: ${word.word}`
                });
            }
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

    formatCategoryName(id: string): string {
        const category = this.state.categories.find(c => c.id === id);
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
                        <th className={sharedStyles.center}>Word</th>
                        <th className={sharedStyles.center}>Category</th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {duplicateWords.map(duplicateWord => (
                        <tr className={sharedStyles.highlight}>
                            <td>{duplicateWord.word || "N/A"}</td>
                            <td>{this.formatCategoryName(duplicateWord.categoryID) || "N/A"}</td>
                            <td>
                                <a className={sharedStyles.link} href={"/wheel/words/edit?id=" + duplicateWord.id}>Edit</a>&nbsp;
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
