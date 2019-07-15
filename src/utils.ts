import { NavigationScreenProps } from 'react-navigation';

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
