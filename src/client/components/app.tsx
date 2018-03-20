import { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import AlternateNamesEditComponent from "./lineup/alternateNamesEdit";
import AlternateNamesListComponent from "./lineup/alternateNamesList";
import MissingNamesListComponent from "./lineup/missingNamesList";
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

    navigationItemOnClick(to: string, event: React.MouseEvent<HTMLElement>): void {
        window.location.href = to;
        event.preventDefault();
    }

    render() {
        const { error } = this.state;
        if (error) {
            return (<div className={styles.error}>{error}</div>);
        } else {
            const NavigationItem = ({ match, to, text, ...rest }) => (
                <Route path={match} children={(routeProps) => (
                    <td className={`${styles.navigationItem} ${routeProps.match ? styles.active : ''}`} onClick={this.navigationItemOnClick.bind(this, to)}>
                        <a href={to}>{text}</a>
                    </td>
                )} />
            );
            return (
                <BrowserRouter>
                    <div className={styles.app}>
                        <div className={styles.mainDiv}>
                            <div className={styles.headerDiv}>
                                <table className={styles.headerTable}>
                                    <tr>
                                        <td className={styles.titleCell}>
                                            <img src="/images/icon.png" height="50" width="50" alt="m" />
                                            <span className={styles.title}>Cubed</span><br />
                                            <span className={styles.titleLeftQuote}>"Running through the fire,</span><br />
                                            <span className={styles.titleRightQuote}>daring you to follow me."</span>
                                        </td>
                                        <td className={styles.userCell}>
                                            <div className={styles.userDiv}>
                                                <div className={styles.loggedInBlock}>Welcome&nbsp;back!</div>
                                                <div className={styles.center}>
                                                    <a href="/logout" className={styles.button}>Logout</a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <table className={styles.navigationTable}>
                                <tr>
                                    <NavigationItem match="/lineup/alternateNames" to="/lineup/alternateNames/list" text="Lineup: Alternate Names" />
                                    <NavigationItem match="/lineup/missingNames" to="/lineup/missingNames/list" text="Lineup: Missing Names" />
                                    <NavigationItem match="/wheel/categories" to="/wheel/categories/list" text="Wheel Capture: Categories" />
                                    <NavigationItem match="/wheel/duplicates" to="/wheel/duplicates/list" text="Wheel Capture: Duplicates" />
                                    <NavigationItem match="/wheel/unverified" to="/wheel/unverified/list" text="Wheel Capture: Unverified" />
                                </tr>
                            </table>
                            <div className={styles.contentDiv}>
                                <Switch>
                                    <Route path="/lineup/alternateNames/edit" component={AlternateNamesEditComponent} />
                                    <Route path="/lineup/alternateNames/list" component={AlternateNamesListComponent} />
                                    <Route path="/lineup/missingNames/list" component={MissingNamesListComponent} />
                                </Switch>
                            </div>
                            <div className={styles.copyrightDiv}>
                                &copy;2012-{new Date().getFullYear()} mCubed Technologies
                            </div>
                        </div>
                    </div>
                </BrowserRouter>
            );
        }
    }
}
