import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

/** Navigate from a tab (or nested) screen to a root stack route. */
export function navigateRoot<Route extends keyof RootStackParamList>(
  navigation: NavigationProp<ParamListBase>,
  name: Route,
  params?: RootStackParamList[Route],
): void {
  const parent = navigation.getParent();
  if (parent?.navigate) {
    parent.navigate(name, params);
    return;
  }
  navigation.navigate(name, params);
}
