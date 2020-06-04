import React from 'react';

export const UserContext = React.createContext({
  currentUser: null,
  setCurrentUser: () => {},
});
