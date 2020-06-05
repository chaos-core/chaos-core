import queryString from "query-string";
import React, { useContext, useState, useEffect } from "react";
import { useLocation, Route, Switch, useRouteMatch } from "react-router-dom";

import { config } from "../chaos-client.js";
import { UserContext } from "../user";

import "./login-page.scss";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function useParam(key) {
  return useQuery().get(key);
}

export const LoginPage = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/callback`} component={CallbackPage}/>
      <Route path={`/`} component={IndexPage}/>
    </Switch>
  );
};

const DiscordLoginBtn = () => {
  function onClick() {
    document.location = queryString.stringifyUrl({
      url: "https://discord.com/api/oauth2/authorize",
      query: {
        "client_id": config.clientId,
        "redirect_uri": config.clientUrl + "/login/callback",
        "response_type": "code",
        "scope": "identify guilds",
        // "prompt": "none",
      },
    });
  }

  return (
    <div className={"discordLoginBtn"} onClick={onClick}>
      Login with Discord
    </div>
  );
};

const IndexPage = () => {
  return (
    <div className={"indexPage"}>
      <DiscordLoginBtn/>
    </div>
  );
};

const CallbackPage = () => {
  const { login } = useContext(UserContext);
  const code = useParam("code");
  const [error, setError] = useState(useParam("error") !== null);

  useEffect(() => {
    if (code) {
      login(code).catch(() => setError(true));
    }
  }, [code]);

  if (!error) return (<div>Logging in...</div>);

  return (
    <div className={"indexPage"}>
      Hmm... Something went wrong. Try Again?
      <DiscordLoginBtn/>
    </div>
  );
};
