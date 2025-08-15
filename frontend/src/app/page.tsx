import { getDevicesServer } from '@/lib/api';
import HomePage from '@/components/HomePage';
import type { Device } from '@/lib/types';

export default async function Page() {
  // サーバー側でデータを取得（デモモードの場合はクライアントサイドで上書きされる）
  let initialHistory: Device[];

  try {
    initialHistory = await getDevicesServer();
  } catch (error) {
    console.error('Failed to fetch initial history:', error);
    initialHistory = [];
  }

  return <HomePage initialHistory={initialHistory} />;
}
