import * as React from "react";
import * as sharedStyles from "./shared.css";

export function compareObjects<T extends { sortAscending?: boolean, sortProperty?: string }>(obj1: any, obj2: any, state: T): number {
    if (!obj1) {
        if (!obj2) {
            return 0;
        } else {
            return state.sortAscending ? -1 : 1;
        }
    } else if (!obj2) {
        return state.sortAscending ? 1 : -1;
    } else {
        const compare = compareValues(obj1[state.sortProperty], obj2[state.sortProperty]);
        const order = state.sortAscending ? 1 : -1;
        return compare * order;
    }
}

function compareValues(val1: any, val2: any): number {
    if (!val1) {
        return !val2 ? 0 : -1;
    } else if (!val2) {
        return 1;
    } else if (val1 < val2) {
        return -1;
    } else if (val1 > val2) {
        return 1;
    }
    return 0;
}

function sortHeaderOnClick(onSort: (propertyName: string, shouldBeAscending: boolean) => void, propertyName: string, shouldBeAscending: boolean): void {
    if (onSort) {
        onSort(propertyName, shouldBeAscending);
    }
}

export default function SortHeader({ display, propertyName, onSort, state, ...rest }) {
    const isSorting = state.sortProperty === propertyName;
    const currentDirection = isSorting ? (state.sortAscending ? "&uarr;" : "&darr;") : "";
    const shouldBeAscending = !isSorting || !state.sortAscending;
    const displayHtml = {
        __html: `${display} ${currentDirection}`
    };
    return (
        <a className={sharedStyles.link} onClick={sortHeaderOnClick.bind(undefined, onSort, propertyName, shouldBeAscending)} dangerouslySetInnerHTML={displayHtml} />
    );
};
