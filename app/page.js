'use client';

import dynamic from 'next/dynamic';

const ClientPage = dynamic(() => import('./ClientPage'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Carregando App...</div>
});

export default function Page() {
  return <ClientPage />;
}
