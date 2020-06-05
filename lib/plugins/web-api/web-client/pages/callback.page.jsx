import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { UserContext } from "../user";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function useParam(key) {
  return useQuery().get(key);
}

export const CallbackPage = () => {
  const { login } = useContext(UserContext);
  const code = useParam("code");
  const [error, setError] = useState(useParam("error") !== null);

  useEffect(() => {
    if (code) {
      login(code).catch(() => setError(true));
    }
  }, [code]);

  if (error) {
    return (<div>Hmm... Something went wrong.</div>);
  } else {
    return (<div>Logging in...</div>);
  }
};
