import { getDevicesServer } from '@/lib/api';
import HomePage from '@/components/HomePage';

export default async function Page() {
  // サーバー側でデータを取得
  const initialHistory = await getDevicesServer();

  return <HomePage initialHistory={initialHistory} />;
}
