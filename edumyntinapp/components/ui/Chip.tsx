import { Text, View } from 'react-native';

interface ChipProps {
  children: string | number;
  tone?: 'brand' | 'muted' | 'leaf' | 'dark';
}

const tones = {
  brand: 'bg-brand-100',
  muted: 'bg-white/70',
  leaf: 'bg-leaf-500/15',
  dark: 'bg-ink/80',
};

const textTones = {
  brand: 'text-brand-900',
  muted: 'text-ink/70',
  leaf: 'text-leaf-700',
  dark: 'text-white',
};

export function Chip({ children, tone = 'muted' }: ChipProps) {
  return (
    <View className={`rounded-full px-3 py-1 ${tones[tone]}`}>
      <Text className={`text-xs font-bold capitalize ${textTones[tone]}`}>{children}</Text>
    </View>
  );
}
