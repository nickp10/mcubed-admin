import { Component } from "react";
import { IWheelCategory } from "../../../interfaces";
import { RouteComponentProps } from "react-router-dom";
import * as React from "react";
import * as sharedStyles from "../shared.css";
import SortHeader, * as sorting from "../sorting";

export interface CategoriesListProps {
}

export interface CategoriesListState {
    error?: string;
    isLoaded?: boolean;
    categories?: IWheelCategory[];
    sortAscending?: boolean;
    sortProperty?: string;
}

export default class CategoriesListComponent extends Component<RouteComponentProps<CategoriesListProps>, CategoriesListState> {
    constructor(props: RouteComponentProps<CategoriesListProps>, context?: any) {
        super(props, context);
        this.state = {
            categories: [],
            sortAscending: true,
            sortProperty: "name"
        };
    }

    sortCategories(sortProperty: string, sortAscending: boolean): void {
        this.setState((previousState, props) => {
            return {
                categories: previousState.categories,
                sortAscending: sortAscending,
                sortProperty: sortProperty,
                isLoaded: previousState.isLoaded
            };
        });
    }

    async componentDidMount() {
        try {
            const res = await fetch("/wheel/categories/list/json", {
                credentials: "same-origin"
            });
            if (res.status !== 200) {
                const error = await res.json();
                throw error;
            }
            const categories = await res.json();
            this.setState((previousState, props) => {
                return {
                    categories: categories,
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

    async deleteCategory(category: IWheelCategory): Promise<void> {
        try {
            const res = await fetch(`/wheel/categories/delete/json?id=${category.id}`, {
                credentials: "same-origin"
            });
            if (res.status !== 200) {
                const error = await res.json();
                throw error;
            }
            this.setState((previousState, props) => {
                return {
                    categories: previousState.categories.filter(c => c.id !== category.id),
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
        const { categories, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                    <tr>
                        <th className={sharedStyles.center}><SortHeader propertyName="name" display="Name" state={this.state} onSort={this.sortCategories.bind(this)} /></th>
                        <th className={sharedStyles.center}>Actions</th>
                    </tr>
                    {categories.sort((a, b) => sorting.compareObjects(a, b, this.state)).map(category => (
                        <tr className={sharedStyles.highlight}>
                            <td><a className={sharedStyles.link} href={`/wheel/categories/${category.id}/list`}>{category.name || "N/A"}</a></td>
                            <td>
                                <a className={sharedStyles.link} href={"/wheel/categories/edit?id=" + category.id}>Edit</a>&nbsp;
                                <a className={sharedStyles.link} onClick={this.deleteCategory.bind(this, category)}>Delete</a>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 &&
                        <tr>
                            <td colSpan={2}>There are no categories.</td>
                        </tr>
                    }
                    <tr>
                        <th colSpan={2} className={sharedStyles.center}>
                            <a className={sharedStyles.link} href="/wheel/categories/edit">Add</a>
                        </th>
                    </tr>
                </table>
            );
        }
    }
}
