import React from 'react';

export function useStateFromProp<TValue>(propValue: TValue) {
  const [state, setState] = React.useState(propValue);
  React.useEffect(() => setState(propValue), [propValue]);
  return [state, setState] as const;
}
