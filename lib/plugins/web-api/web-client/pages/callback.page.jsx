import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { UserContext, UserService } from "../user";

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
        {({ setCurrentUser }) => (
          <AuthorizingPage
            code={query.get("code")}
            setCurrentUser={setCurrentUser}
          />
        )}
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
  const history = useHistory();
  const [error, setError] = useState(false);

  if (error) {
    return (<div>Hmm... Something went wrong.</div>);
  } else {
    UserService.login(code)
      .then(() => setCurrentUser(UserService.getUser()))
      .then(() => history.replace('/'))
      .catch(() => setError(true));

    return (<div>Logging in...</div>);
  }
};
