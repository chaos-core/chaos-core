import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";

import { LogoutBtn } from "./auth/components";
import { UserContext } from "./contexts.js";
import { UserAvatar } from "./user/components";

const AppRouter = () => {
  const userContext = useContext(UserContext);
  const user = userContext.currentUser;

  return (
    <div>
      <div>
        <UserAvatar/>
        Welcome {user.tag}!
        <LogoutBtn/>
      </div>

      <Switch>
        <Route path={'/'}>
          <div>404: Page not found</div>
        </Route>
      </Switch>
    </div>
  );
};

export default AppRouter;
