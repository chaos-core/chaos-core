import React from 'react';

export UserAvatar from './user-avatar.jsx';

export const UserContext = React.createContext({
  currentUser: null,
  setCurrentUser: () => {},
});
