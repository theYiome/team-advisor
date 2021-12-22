import React, { ReactElement, FC, useState, createContext } from 'react';

const initialState: any = {
    patch: null
};

export const ChampionsContext = createContext([initialState, null]);

export const ChampionsProvider: FC<any> = (props): ReactElement => {

    const [champions, setChampions] = useState(initialState);

    return (
        <ChampionsContext.Provider value={[champions, setChampions]}>
            {props.children}
        </ChampionsContext.Provider>
    );
}