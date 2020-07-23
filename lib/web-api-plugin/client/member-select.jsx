import React, {useEffect, useState} from 'react';
import {ChaosApiClient, LoadingSpinner, useGuild} from 'chaos-core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import UserAvatar from 'chaos-core/user/user-avatar.jsx';

import "./member-select.scss";

export const MemberSelect = () => {
  const guild = useGuild();

  const [members, setMembers] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    ChaosApiClient.getMembers({guildId: guild.id})
      .then(setMembers)
      .then(() => setFetching(false));
  }, []);

  if (fetching) return <LoadingSpinner/>;

  return (
    <Autocomplete
      className={'chaos-memberSelect'}
      options={members}
      getOptionLabel={(member) => member.displayName}
      renderInput={(params) => (<TextField {...params} label="Member"/>)}
      renderOption={(member) => (<Member member={member}/>)}
    />
  );
};

export const Member = ({member}) => {
  return (
    <div className={'chaos-member'}>
      <UserAvatar user={member.user} size={'small'}/>
      <div className={'member-name'}>
        <div>{member.displayName}</div>
        <div><small>{member.user.tag}</small></div>
      </div>
    </div>
  );
};
