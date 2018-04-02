import { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import * as querystring from "querystring";
import * as React from "react";
import * as sharedStyles from "../shared.css";

export interface ChangePasswordProps {
}

export interface ChangePasswordState {
    isLoading?: boolean;
    error?: string;
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
}

export default class ChangePasswordComponent extends Component<RouteComponentProps<ChangePasswordProps>, ChangePasswordState> {
    constructor(props: RouteComponentProps<ChangePasswordProps>, context?: any) {
        super(props, context);
        this.state = { };
    }

    async submitForm(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        try {
            event.preventDefault();
            this.setState((previousState, props) => {
                return {
                    error: undefined,
                    currentPassword: previousState.currentPassword,
                    password: previousState.password,
                    confirmPassword: previousState.confirmPassword,
                    isLoading: true
                }
            });
            const res = await fetch("/changePassword/json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: querystring.stringify({
                    currentPassword: this.state.currentPassword || '',
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
                currentPassword: undefined,
                password: undefined,
                confirmPassword: undefined,
                isLoading: false
            });
        }
    }

    currentPasswordChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        const currentPassword = event.target.value;
        this.setState((previousState, props) => {
            return {
                error: previousState.error,
                currentPassword: currentPassword,
                password: previousState.password,
                confirmPassword: previousState.confirmPassword
            };
        });
    }

    passwordChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        const password = event.target.value;
        this.setState((previousState, props) => {
            return {
                error: previousState.error,
                currentPassword: previousState.currentPassword,
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
                currentPassword: previousState.currentPassword,
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
                        <th colSpan={2} className={sharedStyles.center}>Change Password</th>
                    </tr>
                    {isLoading &&
                        <tr>
                            <td colSpan={2}>Loading...</td>
                        </tr>
                    }
                    {!isLoading &&
                        <tr>
                            <td>
                                <strong>Current Password:</strong>
                            </td>
                            <td>
                                <input type="password" name="currentPassword" autoFocus={true} onChange={this.currentPasswordChanged.bind(this)} />
                            </td>
                        </tr>
                    }
                    {!isLoading &&
                        <tr>
                            <td>
                                <strong>New Password:</strong>
                            </td>
                            <td>
                                <input type="password" name="password" onChange={this.passwordChanged.bind(this)} />
                            </td>
                        </tr>
                    }
                    {!isLoading &&
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
                                <input type="submit" value="Change Password" />
                            </th>
                        </tr>
                    }
                </table>
            </form>
        );
    }
}
