import React from 'react';
import ReactDOM from "react-dom";

import AppRouter from "./app-router.jsx";
import styles from "./index.module.scss";

import "./index.scss";

const App = () => (
  <div className={styles.app}>
    <AppRouter/>
  </div>
);

ReactDOM.render(<App/>, document.getElementById("app"));
