import { Component } from "react";
import { BrowserRouter, Route, Routes, matchPath, useLocation, useSearchParams, useParams } from "react-router-dom";
import clientAppState from "../clientAppState";
import AlternateNamesEditComponent from "./lineup/alternateNamesEdit";
import AlternateNamesListComponent from "./lineup/alternateNamesList";
import CategoryEditComponent from "./wheel/categoryEdit";
import CategoriesListComponent from "./wheel/categoriesList";
import CategoryWordListComponent from "./wheel/categoryWordList";
import ChangePasswordComponent from "./auth/changePassword";
import DuplicateWordsListComponent from "./wheel/duplicateWordsList";
import LoginComponent from "./auth/login";
import MissingNamesListComponent from "./lineup/missingNamesList";
import UnverifiedWordsListComponent from "./wheel/unverifiedWordsList";
import WordEditComponent from "./wheel/wordEdit";
import * as React from "react";
import styles from "./app.css";

export interface AppProps {
}

export interface AppState {
    error?: string;
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = { };
    }

    navigationItemOnClick(to: string, event: React.MouseEvent<HTMLElement>): void {
        window.location.href = to;
        event.preventDefault();
    }

    render() {
        const { serverError } = clientAppState;
        const { error } = this.state;
        const NavigationItem = ({ match, to, text, ...rest }) => (
            <td className={`${styles.navigationItem} ${matchPath(match, useLocation().pathname) ? styles.active : ''}`} onClick={this.navigationItemOnClick.bind(this, to)}>
                <a href={to}>{text}</a>
            </td>
        );
        const AlternateNamesEditComponentWrapper = () => {
            const [ searchParams ] = useSearchParams();
            return <AlternateNamesEditComponent alternateNameID={searchParams.get("id")} externalName={searchParams.get("externalName")} />
        };
        const CategoryEditComponentWrapper = () => {
            const [ searchParams ] = useSearchParams();
            return <CategoryEditComponent categoryID={searchParams.get("id")} />
        };
        const CategoryWordListComponentWrapper = () => {
            const { categoryID } = useParams();
            return <CategoryWordListComponent categoryID={categoryID} />
        };
        const WordEditComponentWrapper = () => {
            const { categoryID } = useParams();
            const [ searchParams ] = useSearchParams();
            return <WordEditComponent categoryID={categoryID} wordID={searchParams.get("id")} />
        };
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
                                    {clientAppState.isLoggedIn && (
                                        <td className={styles.userCell}>
                                            <div className={styles.userDiv}>
                                                <div className={styles.loggedInBlock}>Welcome&nbsp;back!</div>
                                                <div className={styles.center}>
                                                    <a href="/changePassword" className={styles.button}>Change&nbsp;Password</a>&nbsp;
                                                    <a href="/logout" className={styles.button}>Logout</a>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            </table>
                        </div>
                        {clientAppState.isLoggedIn && (
                            <table className={styles.navigationTable}>
                                <tr>
                                    <NavigationItem match="/lineup/alternateNames/*" to="/lineup/alternateNames/list" text="Lineup: Alternate Names" />
                                    <NavigationItem match="/lineup/missingNames/*" to="/lineup/missingNames/list" text="Lineup: Missing Names" />
                                    <NavigationItem match="/wheel/categories/*" to="/wheel/categories/list" text="Wheel Capture: Categories" />
                                    <NavigationItem match="/wheel/duplicates/*" to="/wheel/duplicates/list" text="Wheel Capture: Duplicates" />
                                    <NavigationItem match="/wheel/unverified/*" to="/wheel/unverified/list" text="Wheel Capture: Unverified" />
                                </tr>
                            </table>
                        )}
                        <div className={styles.contentDiv}>
                            {!!serverError && (
                                <div className={styles.error}>{serverError}</div>
                            )}
                            {!serverError && (
                                <Routes>
                                    <Route path="/login" element={<LoginComponent />} />
                                    <Route path="/changePassword" element={<ChangePasswordComponent />} />
                                    <Route path="/lineup/alternateNames/edit" element={<AlternateNamesEditComponentWrapper />} />
                                    <Route path="/lineup/alternateNames/list" element={<AlternateNamesListComponent />} />
                                    <Route path="/lineup/missingNames/list" element={<MissingNamesListComponent />} />
                                    <Route path="/wheel/categories/edit" element={<CategoryEditComponentWrapper />} />
                                    <Route path="/wheel/categories/list" element={<CategoriesListComponent />} />
                                    <Route path="/wheel/categories/:categoryID/list" element={<CategoryWordListComponentWrapper />} />
                                    <Route path="/wheel/categories/:categoryID/words/edit" element={<WordEditComponentWrapper />} />
                                    <Route path="/wheel/duplicates/list" element={<DuplicateWordsListComponent />} />
                                    <Route path="/wheel/unverified/list" element={<UnverifiedWordsListComponent />} />
                                </Routes>
                            )}
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
