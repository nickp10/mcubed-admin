import { Component } from "react";
import { IWheelCategory } from "../../../interfaces";
import { RouteComponentProps } from "react-router-dom";
import * as qs from "querystring";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface CategoryEditProps {
}

export interface CategoryEditState {
    category?: IWheelCategory;
    categoryID?: string;
    error?: string;
    isLoaded?: boolean;
}

export default class CategoryEditComponent extends Component<RouteComponentProps<CategoryEditProps>, CategoryEditState> {
    constructor(props: RouteComponentProps<CategoryEditProps>, context?: any) {
        super(props, context);
        const search = this.props.location.search;
        const query = qs.parse(search && search.startsWith("?") ? search.substr(1) : search);
        this.state = {
            categoryID: this.getQueryStringValue(query, "id")
        };
    }

    getQueryStringValue(query: qs.ParsedUrlQuery,  key: string): string {
        const value = query[key];
        return Array.isArray(value) ? (value.length > 0 ? value[0] : undefined) : value;
    }

    useCategory(category: IWheelCategory): void {
        this.setState((previousState, props) => {
            return {
                category: category,
                categoryID: previousState.categoryID,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.state.categoryID) {
                const res = await fetch(`/wheel/categories/get/json?id=${this.state.categoryID}`, {
                    credentials: "same-origin"
                });
                if (res.status !== 200) {
                    const error = await res.json();
                    throw error;
                }
                const category = await res.json();
                this.useCategory(category);
            } else {
                this.useCategory({ });
            }
        } catch (error) {
            this.setState((previousState, props) => {
                return {
                    categoryID: previousState.categoryID,
                    error: error.message
                };
            });
        }
    }

    render() {
        const { category, error, isLoaded } = this.state;
        if (error) {
            return (<div className={sharedStyles.error}>{error}</div>);
        } else if (!isLoaded) {
            return (<div>Loading...</div>);
        } else {
            return (
                <form action="/wheel/categories/edit" method="POST">
                    <input type="hidden" name="id" value={category.id} />
                    <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>{category.id ? "Edit" : "Add"} Category</th>
                        </tr>
                        <tr>
                            <td>
                                <strong>Name:</strong><br /><br />
                                The name of the category.
                            </td>
                            <td>
                                <input type="text" name="name" autoFocus={true} defaultValue={category.name} />
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
