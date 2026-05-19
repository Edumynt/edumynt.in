import { Text, View } from 'react-native';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  detail?: string;
}

export function SectionHeader({ eyebrow, title, detail }: SectionHeaderProps) {
  return (
    <View className="mb-4 mt-8">
      {eyebrow ? (
        <Text className="mb-1 text-xs font-black uppercase tracking-[2px] text-brand-600">{eyebrow}</Text>
      ) : null}
      <View className="flex-row items-end justify-between gap-4">
        <Text className="flex-1 text-2xl font-black text-ink">{title}</Text>
        {detail ? <Text className="mb-1 text-sm font-bold text-ink/50">{detail}</Text> : null}
      </View>
    </View>
  );
}
