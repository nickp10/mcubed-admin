declare namespace SharedCssNamespace {
  export interface ISharedCss {
    center: string;
    content: string;
    error: string;
    highlight: string;
    link: string;
    w30: string;
    w75: string;
  }
}

declare const SharedCssModule: SharedCssNamespace.ISharedCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SharedCssNamespace.ISharedCss;
};

export = SharedCssModule;
