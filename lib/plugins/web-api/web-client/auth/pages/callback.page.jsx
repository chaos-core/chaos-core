import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { UserContext } from "../../contexts.js";
import AuthService from "../auth-service";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const CallbackPage = () => {
  let query = useQuery();

  if (query.get("error")) {
    return <ErrorPage errorMsg={query.get("error_description")}/>;
  } else {
    return (
      <UserContext.Consumer>
        {({ setCurrentUser }) => <AuthorizingPage code={query.get("code")}
                                                  setCurrentUser={setCurrentUser}/>}
      </UserContext.Consumer>
    );
  }
};

const ErrorPage = ({ errorMsg }) => (
  <div>
    Login Permission denied...
    {errorMsg}
  </div>
);

const AuthorizingPage = ({ code, setCurrentUser }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    AuthService.login(code)
      .then(() => new Promise((resolve => setTimeout(resolve, 500))))
      .then(() => setCurrentUser(AuthService.getUser()))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (<div>Hmm... Something went wrong.</div>);
  } else {
    return (<div>Logging in...</div>);
  }
};
