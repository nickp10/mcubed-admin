import { Component } from "react";
import clientAppState from "../../clientAppState";
import * as querystring from "querystring";
import * as React from "react";
import sharedStyles from "../shared.css";

export interface LoginProps {
}

export interface LoginState {
    isLoading?: boolean;
    error?: string;
    password?: string;
    confirmPassword?: string;
}

export default class LoginComponent extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = { };
    }

    async submitForm(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        try {
            event.preventDefault();
            this.setState((previousState, props) => {
                return {
                    error: undefined,
                    password: previousState.password,
                    confirmPassword: previousState.confirmPassword,
                    isLoading: true
                }
            });
            const path = clientAppState.hasAdminAccount ? "/login/json" : "/createPassword/json";
            const res = await fetch(path, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: querystring.stringify({
                    password: this.state.password || '',
                    confirmPassword: this.state.confirmPassword || ''
                }),
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
                confirmPassword: undefined,
                isLoading: false
            });
        }
    }

    passwordChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        const password = event.target.value;
        this.setState((previousState, props) => {
            return {
                error: previousState.error,
                password: password,
                confirmPassword: previousState.confirmPassword
            };
        });
    }

    confirmPasswordChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        const confirmPassword = event.target.value;
        this.setState((previousState, props) => {
            return {
                error: previousState.error,
                password: previousState.password,
                confirmPassword: confirmPassword
            };
        });
    }

    render() {
        const { error, isLoading } = this.state;
        return (
            <form onSubmit={this.submitForm.bind(this)}>
                <table className={`${sharedStyles.content} ${sharedStyles.w30}`}>
                    <tr>
                        <th colSpan={2} className={sharedStyles.center}>{clientAppState.hasAdminAccount ? 'Login' : 'Create Password'}</th>
                    </tr>
                    {isLoading &&
                        <tr>
                            <td colSpan={2}>Logging in...</td>
                        </tr>
                    }
                    {!isLoading && !clientAppState.hasAdminAccount &&
                        <tr>
                            <td colSpan={2}>The admin page needs to be setup. Create a password for the admin user.</td>
                        </tr>
                    }
                    {!isLoading &&
                        <tr>
                            <td>
                                <strong>Password:</strong>
                            </td>
                            <td>
                                <input type="password" name="password" autoFocus={true} onChange={this.passwordChanged.bind(this)} />
                            </td>
                        </tr>
                    }
                    {!isLoading && !clientAppState.hasAdminAccount &&
                        <tr>
                            <td>
                                <strong>Confirm Password:</strong>
                            </td>
                            <td>
                                <input type="password" name="confirmPassword" onChange={this.confirmPasswordChanged.bind(this)} />
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
                                <input type="submit" value={clientAppState.hasAdminAccount ? 'Login' : 'Create Password'} />
                            </th>
                        </tr>
                    }
                </table>
            </form>
        );
    }
}
