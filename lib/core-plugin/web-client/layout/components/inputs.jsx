import React, {useState} from 'react';

import './inputs.scss';

export const TextInput = ({placeholder, value = ''}) => {
  const [inputValue, setValue] = useState(value);

  const inputChange = (e) => setValue(e.target.value);

  return (
    <input
      type={'text'}
      className={'chaos-text-input'}
      placeholder={placeholder}
      value={inputValue}
      onChange={inputChange}
    />
  );
};
