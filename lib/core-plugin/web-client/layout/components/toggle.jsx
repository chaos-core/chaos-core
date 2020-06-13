import classNames from 'classnames';
import React from 'react';

import './toggle.scss';

const Toggle = ({active, disabled, onClick}) => {
  const divClass = classNames('chaos-toggle', {
    active: active,
    disabled: disabled,
  });

  const onSwitchClick = (e) => {
    e.stopPropagation();
    if (!disabled) onClick();
  };

  return (
    <div className={divClass} onClick={onSwitchClick}>
      <div className={'switch'}/>
    </div>
  );
};

export default Toggle;
