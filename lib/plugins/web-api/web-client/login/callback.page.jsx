import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';

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
    (async () => {
      let response = await axios.post("/api/login", { code });
      console.log(response.data);
    })();
  }, []);

  return (
    <div>
      Welcome back. Let me check your ID.
    </div>
  );
};
