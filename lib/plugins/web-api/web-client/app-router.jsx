import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";

import { LogoutBtn } from "./auth/components";
import { GuildsProvider } from "./guilds";
import { GuildsList } from "./guilds/components";
import { UserContext } from "./user";
import { UserAvatar } from "./user/components";

const AppRouter = () => {
  const userContext = useContext(UserContext);
  const user = userContext.currentUser;

  return (
    <div>
      <GuildsProvider>
        <div>
          <UserAvatar/>
          Welcome {user.tag}!
          <LogoutBtn/>
        </div>

        <Switch>
          <Route exact path={'/'}>
            <h1>Guilds</h1>
            <GuildsList/>
          </Route>
          <Route path={'/'}>
            <div>404: Page not found</div>
          </Route>
        </Switch>
      </GuildsProvider>
    </div>
  );
};

export default AppRouter;
