import React from 'react';
import { isEqual } from './utils';

export function useDerivedState<TValue>(derivedValue: TValue) {
  const [state, setState] = React.useState(derivedValue);
  const prevDerivedValue = usePrevious(derivedValue);
  React.useEffect(() => {
    if (!isEqual(prevDerivedValue, derivedValue) && !isEqual(state, derivedValue)) {
      setState(derivedValue);
    }
  });
  return [state, setState] as const;
}

function usePrevious<TValue>(value: TValue) {
  const ref = React.useRef<TValue>();

  React.useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
