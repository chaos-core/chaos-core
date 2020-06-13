import queryString from 'query-string';
import React, {useContext, useEffect, useState} from 'react';
import {Route, Switch, useLocation, useRouteMatch} from 'react-router-dom';

import {config} from '../chaos-client.js';
import {UserContext} from '../user';
import {Card, LoadingSpinner} from '../layout/components';

import './login-page.scss';

function useParam(key) {
  const query = new URLSearchParams(useLocation().search);
  return query.get(key);
}

export const LoginPage = () => {
  const {path} = useRouteMatch();

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
      url: 'https://discord.com/api/oauth2/authorize',
      query: {
        'client_id': config.clientId,
        'redirect_uri': config.clientUrl + '/login/callback',
        'response_type': 'code',
        'scope': 'identify guilds',
        // "prompt": "none",
      },
    });
  }

  return (
    <div className={'discordLoginBtn'} onClick={onClick}>
      Login with Discord
    </div>
  );
};

const IndexPage = () => {
  return (
    <Card className={'indexPage'}>
      <DiscordLoginBtn/>
    </Card>
  );
};

const CallbackPage = () => {
  const {login} = useContext(UserContext);
  const code = useParam('code');
  const [error, setError] = useState(useParam('error') !== null);

  useEffect(() => {
    if (code) {
      login(code).catch(() => setError(true));
    }
  }, [code]);

  if (!error) return (
    <Card className={'indexPage'}>
      <LoadingSpinner/>
    </Card>
  );

  return (
    <Card className={'indexPage'}>
      Hmm... Something went wrong. Try Again?
      <DiscordLoginBtn/>
    </Card>
  );
};
