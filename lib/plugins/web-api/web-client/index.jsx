import React from 'react';
import ReactDOM from "react-dom";

import AppRouter from "./app-router.jsx";

import "./index.scss";
import { UserProvider } from "./user";
import { AppLayout } from "./layout";
import { GuildProvider } from "./guilds";

const App = () => {
  return (
    <div className={"app"}>
      <UserProvider>
        <GuildProvider>
          <AppLayout>
            <AppRouter/>
          </AppLayout>
        </GuildProvider>
      </UserProvider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
