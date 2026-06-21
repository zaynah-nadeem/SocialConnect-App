import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

/** Navigate from a tab (or nested) screen to a root stack route. */
export function navigateRoot<Route extends keyof RootStackParamList>(
  navigation: NavigationProp<ParamListBase>,
  name: Route,
  params?: RootStackParamList[Route],
): void {
  const parent = navigation.getParent();
  const nav = parent ?? navigation;
  (nav.navigate as (screen: string, p?: object) => void)(name, params);
}
