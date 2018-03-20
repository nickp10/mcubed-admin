import { Component } from "react";
import { IWheelCategory, IWheelWord } from "../../../interfaces";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface UnverifiedWordsListProps {
}

export interface UnverifiedWordsListState {
    error?: string;
    isLoaded?: boolean;
    categories?: IWheelCategory[];
    unverifiedWords?: IWheelWord[];
}

export default class UnverifiedWordsListComponent extends Component<UnverifiedWordsListProps, UnverifiedWordsListState> {
    constructor(props: UnverifiedWordsListProps, context?: any) {
        super(props, context);
        this.state = {
            categories: [],
            unverifiedWords: []
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
                    unverifiedWords: words.filter(w => !w.approved),
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
                    isLoaded: false
                };
            });
            const ids = this.state.unverifiedWords.map(w => w.id).join(",");
            const res1 = await fetch("/wheel/words/approveMany/json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `ids=${ids}`
            });
            if (res1.status === 200) {
                const res2 = await fetch("/wheel/words/list/json");
                const words: IWheelWord[] = await res2.json();
                this.setState((previousState, props) => {
                    return {
                        categories: previousState.categories,
                        unverifiedWords: words.filter(w => !w.approved),
                        isLoaded: true
                    };
                });
            } else {
                this.setState({
                    error: `Could not approve all the words`
                });
            }
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
                        unverifiedWords: previousState.unverifiedWords.filter(w => w.id !== word.id),
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

    formatCategoryName(id: string): string {
        const category = this.state.categories.find(c => c.id === id);
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
                        <th className={sharedStyles.center}>Word</th>
                        <th className={sharedStyles.center}>Category</th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {unverifiedWords.map(unverifiedWord => (
                        <tr className={sharedStyles.highlight}>
                            <td>{unverifiedWord.word || "N/A"}</td>
                            <td>{this.formatCategoryName(unverifiedWord.categoryID) || "N/A"}</td>
                            <td>
                                <a className={sharedStyles.link} href={"/wheel/words/edit?id=" + unverifiedWord.id}>Edit</a>&nbsp;
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
