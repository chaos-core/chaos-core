import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./app-router.jsx";
import { AuthService } from "./auth";
import { AuthGate, LoginRouter } from "./auth/components";

import styles from "./index.module.scss";
import "./index.scss";
import { UserContext } from "./user";

const App = () => {
  const [currentUser, setCurrentUser] = useState(AuthService.getUser());

  return (
    <div className={styles.app}>
      <UserContext.Provider value={{ currentUser, setCurrentUser }}>
        <Router>
          <AuthGate
            loggedOut={<LoginRouter/>}
            loggedIn={<AppRouter/>}
          />
        </Router>
      </UserContext.Provider>
    </div>
  );
};

ReactDOM.render(<App/>, document.getElementById("app"));
