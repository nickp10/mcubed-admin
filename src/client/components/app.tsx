import { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import AlternateNamesList from "./lineup/alternateNamesList";
import * as React from "react";
import * as styles from "./app.css";

export interface AppProps {
}

export interface AppState {
    error?: string;
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps, context?: any) {
        super(props, context);
        this.state = { };
    }

    async componentDidMount() {
        try {
            //const res = await fetch("/");
            //const alternateNames = await res.json();
            //this.setState({ });
        } catch (error) {
            this.setState({
                error: error.message
            });
        }
    }

    render() {
        const { error } = this.state;
        if (error) {
            return (<div>{error}</div>);
        } else {
            return (
                <BrowserRouter>
                    <div className={styles.app}>
                        <Switch>
                            <Route path="/lineup/alternateNames/list" component={AlternateNamesList} />
                        </Switch>
                    </div>
                </BrowserRouter>
            );
        }
    }
}
