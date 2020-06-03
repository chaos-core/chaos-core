import React, { useContext } from "react";
import { UserContext } from "./contexts.js";

const AppRouter = () => {
  const userContext = useContext(UserContext);
  const user = userContext.currentUser;

  return (
    <div>Welcome {user.tag}!</div>
  );
};

export default AppRouter;
