import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-canvas p-6">
        <Text className="text-2xl font-black text-ink">This screen does not exist.</Text>

        <Link href="/" className="mt-5 rounded-2xl bg-ink px-5 py-3">
          <Text className="font-black text-white">Go home</Text>
        </Link>
      </View>
    </>
  );
}
