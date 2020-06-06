import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./app-router.jsx";
import { UserProvider } from "./user";
import { GuildProvider } from "./guilds";

import "./index.scss";

const App = () => {
  return (
    <div className={"app"}>
      <UserProvider>
        <GuildProvider>
          <Router>
            <AppRouter/>
          </Router>
        </GuildProvider>
      </UserProvider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
