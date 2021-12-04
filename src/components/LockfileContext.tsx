import React, { ReactElement, FC, useState, createContext } from 'react';

const initialState: any = {
    protocol: "https",
    port: "",
    username: "riot",
    password: ""
};

export const LockfileContext = createContext([initialState, null]);

export const LockfileProvider: FC<any> = (props): ReactElement => {

    const [lockfileContent, setLockfileContent] = useState(initialState);

    return (
        <LockfileContext.Provider value={[lockfileContent, setLockfileContent]}>
            {props.children}
        </LockfileContext.Provider>
    );
}