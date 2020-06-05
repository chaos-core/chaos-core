import React, { useContext } from "react";
import { Route, Switch, BrowserRouter as Router, Redirect } from "react-router-dom";

import { UserContext } from "./user";
import { HomePage, CallbackPage, LoginPage } from "./pages";

const AppRouter = () => {
  const { currentUser } = useContext(UserContext);

  return (
    <Router>
      <Switch>
        <Route exact path={`/login`}>
          {currentUser ? <Redirect to={"/"}/> : <LoginPage/>}
        </Route>
        <Route exact path={`/login/callback`}>
          {currentUser ? <Redirect to={"/"}/> : <CallbackPage/>}
        </Route>
        <Route path={'/'}>
          {currentUser ? <HomePage/> : <Redirect to={"/login"}/>}
        </Route>
      </Switch>
    </Router>
  );
};

export default AppRouter;
