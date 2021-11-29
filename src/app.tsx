import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TeamAdvisor } from './components/TeamAdvisor';

function render() {
    ReactDOM.render(<TeamAdvisor/>, document.getElementById("app"));
}

render();