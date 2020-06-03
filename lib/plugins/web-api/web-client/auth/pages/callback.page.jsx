import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import AuthService from "../auth-service";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const CallbackPage = () => {
  let query = useQuery();

  if (query.get("error")) {
    return <ErrorPage errorMsg={query.get("error_description")}/>;
  } else {
    return <AuthorizingPage code={query.get("code")}/>;
  }
};

const ErrorPage = ({ errorMsg }) => (
  <div>
    Login Permission denied...
    {errorMsg}
  </div>
);

const AuthorizingPage = ({ code }) => {
  useEffect(() => {
    AuthService.login(code)
      .then(() => console.log(AuthService.currentUser))
      .catch(console.error);
  }, []);

  return (
    <div>
      Welcome back. Let me check your ID.
    </div>
  );
};
