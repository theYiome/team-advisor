import * as ReactDOMClient from 'react-dom/client';
import { SettingsProvider } from './components/Settings/SettingsProvider';
import { Main } from './components/Main';
import React from 'react';


const container = document.getElementById('app');

// Create a root.
const root = ReactDOMClient.createRoot(container);

const ReactApp = () => (
    <React.StrictMode>
        <SettingsProvider>
            <Main />
        </SettingsProvider>
    </React.StrictMode>
);

// Initial render: Render an element to the root.
root.render(<ReactApp />);