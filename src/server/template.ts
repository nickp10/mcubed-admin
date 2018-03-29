import { IClientAppState } from "../interfaces";

export default (title?: string, clientAppState?: IClientAppState) => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <script>window.__CLIENT_APP_STATE__ = ${JSON.stringify(clientAppState)};</script>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <title>mCubed Admin${title ? ': ' + title : ''}</title>
                <link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
            </head>
            <body>
                <div id="root"></div>
                <script src="/client.js"></script>
            </body>
        </html>
    `;
};
