import { Pressable, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StateViewProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof FontAwesome.glyphMap;
}

export function StateView({ title, message, actionLabel, onAction, icon = 'book' }: StateViewProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-5 h-16 w-16 items-center justify-center rounded-3xl bg-brand-100">
        <FontAwesome name={icon} size={26} color="#b66517" />
      </View>
      <Text className="text-center text-2xl font-black text-ink">{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-ink/60">{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="mt-6 rounded-2xl bg-ink px-5 py-3">
          <Text className="font-bold text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
