import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./app-router.jsx";
import { AuthService } from "./auth";
import { AuthGate, LoginRouter } from "./auth/components";
import { AppLayout } from "./layout";
import { UserContext } from "./user";

import "./index.scss";

const App = () => {
  const [currentUser, setCurrentUser] = useState(AuthService.getUser());

  return (
    <div className={"app"}>
      <UserContext.Provider value={{ currentUser, setCurrentUser }}>
        <AppLayout>
          <Router>
            <AuthGate
              loggedOut={<LoginRouter/>}
              loggedIn={<AppRouter/>}
            />
          </Router>
        </AppLayout>
      </UserContext.Provider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
