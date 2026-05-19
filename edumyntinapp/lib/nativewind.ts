import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
