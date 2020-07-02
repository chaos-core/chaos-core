import React, { useContext } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { UserContext } from "./user";
import { HomePage, LoginPage } from "./pages";
import AppLayout from "./layout/app-layout.jsx";

const AppRouter = () => {
  const { currentUser } = useContext(UserContext);

  return (
    <AppLayout>
      <Switch>
        <Route path={`/login`}>
          {currentUser ? <Redirect to={"/"}/> : <LoginPage/>}
        </Route>
        <Route path={'/'}>
          {currentUser ? <HomePage/> : <Redirect to={"/login"}/>}
        </Route>
      </Switch>
    </AppLayout>
  );
};

export default AppRouter;
