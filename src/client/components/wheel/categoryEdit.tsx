import { Component } from "react";
import { IWheelCategory } from "../../../interfaces";
import { idToString }  from "../../../objectIDUtils";
import * as React from "react";
import sharedStyles from "../shared.css";

export interface CategoryEditProps {
    categoryID: string;
}

export interface CategoryEditState {
    category?: IWheelCategory;
    error?: string;
    isLoaded?: boolean;
}

export default class CategoryEditComponent extends Component<CategoryEditProps, CategoryEditState> {
    constructor(props: CategoryEditProps) {
        super(props);
        this.state = { };
    }

    useCategory(category: IWheelCategory): void {
        this.setState((previousState, props) => {
            return {
                category: category,
                isLoaded: true
            };
        });
    }

    async componentDidMount() {
        try {
            if (this.props.categoryID) {
                const res = await fetch(`/wheel/categories/get/json?id=${this.props.categoryID}`, {
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
                    <input type="hidden" name="id" value={idToString(category._id)} />
                    <table className={`${sharedStyles.content} ${sharedStyles.w75}`}>
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>{category._id ? "Edit" : "Add"} Category</th>
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
