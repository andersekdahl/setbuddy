import { NavigationScreenProps, NavigationScreenComponent, NavigationStackScreenOptions } from 'react-navigation';

export type Screen<TParams = {}> = NavigationScreenComponent<TParams, NavigationStackScreenOptions>;

export function getNavParam<TParams, TKey extends keyof TParams>(
  props: NavigationScreenProps<TParams>,
  paramName: TKey,
  defaultValue: TParams[TKey] | undefined = undefined,
) {
  return (props.navigation.getParam(paramName) as TParams[TKey] | undefined) || defaultValue;
}

export function getNavParamOrThrow<TParams, TKey extends keyof TParams>(
  props: NavigationScreenProps<TParams>,
  paramName: TKey,
) {
  const paramValue = props.navigation.getParam(paramName) as TParams[TKey];
  if (paramValue == null || paramValue === undefined) {
    throw new Error(
      "The mandatory nav param '" + paramName + "' was not passed to the screen " + props.navigation.state.routeName,
    );
  }
  return paramValue;
}

export function addOrRemove<T>(item: T, arr: readonly T[], comparer = (t1: T, t2: T) => t1 === t2) {
  const writable = arr.slice();
  const index = arr.findIndex(t => comparer(item, t));
  if (index === -1) {
    writable.push(item);
  } else {
    writable.splice(index, 1);
  }
  return writable;
}

export function isEqual(x: any, y: any) {
  if (x === y) {
    return true;
  }
  if (typeof x !== typeof y) {
    return false;
  }

  if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) {
      return false;
    }
    for (let i = 0; i < x.length; i++) {
      if (!isEqual(x[i], y[i])) {
        return false;
      }
    }
    return true;
  }

  if (typeof x === 'object' && typeof y === 'object') {
    if (x === null || y === null) {
      // We can safely return false. Both can't be null since we did a === check at the top.
      return false;
    }
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y);
    if (xKeys.length !== yKeys.length) {
      return false;
    }
    for (let i = 0; i < xKeys.length; i++) {
      if (yKeys.indexOf(xKeys[i]) === -1) {
        // Since we already know that xKeys.length and yKeys.length are the same we
        // don't have to also check if yKeys contains keys that xKeys doesn't
        return false;
      }
      if (!isEqual(x[xKeys[i]], y[xKeys[i]])) {
        return false;
      }
    }
    return true;
  }

  return false;
}
