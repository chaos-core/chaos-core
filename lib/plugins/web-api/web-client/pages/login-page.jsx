import queryString from "query-string";
import React from "react";

import { config } from "../chaos-client.js";

import "./login-page.scss";

export const LoginPage = () => (
  <div className={"indexPage"}>
    <DiscordLoginBtn/>
  </div>
);

const DiscordLoginBtn = () => {
  function onClick() {
    document.location = queryString.stringifyUrl({
      url: "https://discord.com/api/oauth2/authorize",
      query: {
        "client_id": config.clientId,
        "redirect_uri": config.clientUrl + "/login/callback",
        "response_type": "code",
        "scope": "identify guilds",
        "prompt": "none",
      },
    });
  }

  return (
    <div className={"discordLoginBtn"} onClick={onClick}>
      Login with Discord
    </div>
  );
};
