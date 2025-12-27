import { useNavigation as useNativeNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useNavigation = () => useNativeNavigation<NavigationProp>();
