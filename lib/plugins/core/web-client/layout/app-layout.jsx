import React, { useContext } from "react";
import AppHeader from "./app-header.jsx";

import "./app-layout.scss";
import { UserContext } from "../user";

const AppLayout = ({ children }) => {
  const { currentUser } = useContext(UserContext);

  return (
    <div className={"appLayout"}>
      {currentUser ? <AppHeader/> : null}
      <main>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
