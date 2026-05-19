import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

export function Screen({ children, scroll = true, className = '', contentClassName = '' }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-canvas ${className}`} edges={['top']}>
        <View className={`flex-1 ${contentClassName}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-canvas ${className}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={`px-5 pb-10 ${contentClassName}`}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
