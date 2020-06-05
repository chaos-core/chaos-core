import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./app-router.jsx";
import { AuthGate, LoginRouter } from "./auth";
import { AppLayout } from "./layout";

import "./index.scss";
import { UserProvider } from "./user";

const App = () => {
  return (
    <div className={"app"}>
      <UserProvider>
        <AppLayout>
          <Router>
            <AuthGate
              loggedOut={<LoginRouter/>}
              loggedIn={<AppRouter/>}
            />
          </Router>
        </AppLayout>
      </UserProvider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
