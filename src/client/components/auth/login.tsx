import { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface LoginProps {
}

export interface LoginState {
    isLoading?: boolean;
    error?: string;
    password?: string;
}

export default class LoginComponent extends Component<RouteComponentProps<LoginProps>, LoginState> {
    constructor(props: RouteComponentProps<LoginProps>, context?: any) {
        super(props, context);
        this.state = { };
    }

    async attemptLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        try {
            event.preventDefault();
            this.setState((previousState, props) => {
                return {
                    error: undefined,
                    password: previousState.password,
                    isLoading: true
                }
            });
            const res = await fetch(`/login/json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `password=${this.state.password}`,
                credentials: "same-origin"
            });
            if (res.status !== 200) {
                const error = await res.json();
                throw error;
            }
            window.location.href = "/";
        } catch (error) {
            this.setState({
                error: error.message,
                password: undefined,
                isLoading: false
            });
        }
    }

    passwordChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        const password = event.target.value;
        this.setState((previousState, props) => {
            return {
                error: previousState.error,
                password: password
            };
        });
    }

    render() {
        const { error, isLoading } = this.state;
        return (
            <form onSubmit={this.attemptLogin.bind(this)}>
                <table className={`${sharedStyles.content} ${sharedStyles.w30}`}>
                    <tr>
                        <th colSpan={2} className={sharedStyles.center}>Login</th>
                    </tr>
                    {isLoading &&
                        <tr>
                            <td colSpan={2}>Logging in...</td>
                        </tr>
                    }
                    {!isLoading &&
                        <tr>
                            <td>
                                <strong>Password:</strong>
                            </td>
                            <td>
                                <input type="text" name="password" autoFocus={true} onChange={this.passwordChanged.bind(this)} />
                            </td>
                        </tr>
                    }
                    {error &&
                        <tr>
                            <td colSpan={2} className={sharedStyles.error}>{error}</td>
                        </tr>
                    }
                    {!isLoading &&
                        <tr>
                            <th colSpan={2} className={sharedStyles.center}>
                                <input type="submit" value="Login" />
                            </th>
                        </tr>
                    }
                </table>
            </form>
        );
    }
}
