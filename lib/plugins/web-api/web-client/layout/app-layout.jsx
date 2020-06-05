import React from "react";
import { AppHeader } from "./components";

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
