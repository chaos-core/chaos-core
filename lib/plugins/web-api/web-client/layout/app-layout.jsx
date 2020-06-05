import React from "react";
import AppHeader from "./app-header.jsx";

import "./app-layout.scss";

const AppLayout = ({ children }) => {
  return (
    <div className={"appLayout"}>
      <AppHeader/>
      <main>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
