import React from 'react';
import ReactDOM from "react-dom";

import AppRouter from "./app-router.jsx";

import "./index.scss";
import { UserProvider } from "./user";
import { AppLayout } from "./layout";

const App = () => {
  return (
    <div className={"app"}>
      <UserProvider>
        <AppLayout>
          <AppRouter/>
        </AppLayout>
      </UserProvider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
