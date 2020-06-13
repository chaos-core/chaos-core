import classNames from 'classnames';
import React from 'react';

import './card.scss';

export const Card = ({className = null, onClick = null, children}) => {
  const divClass = classNames('chaos-card', className);
  return <div className={divClass} onClick={onClick} children={children}/>;
};
