declare namespace AppCssNamespace {
  export interface IAppCss {
    active: string;
    app: string;
    button: string;
    center: string;
    contentDiv: string;
    copyrightDiv: string;
    error: string;
    headerDiv: string;
    headerTable: string;
    loggedInBlock: string;
    mainDiv: string;
    navigationItem: string;
    navigationTable: string;
    title: string;
    titleCell: string;
    titleLeftQuote: string;
    titleRightQuote: string;
    userCell: string;
    userDiv: string;
  }
}

declare const AppCssModule: AppCssNamespace.IAppCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AppCssNamespace.IAppCss;
};

export = AppCssModule;
