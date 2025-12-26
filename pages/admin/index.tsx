import React, { useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/router';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminLayout from '@/components/AdminLayout'; // Componente de layout que você já tem em App.tsx (agora isolado)

export default function AdminIndex() {
  const { admin } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!admin) router.push('/admin/login');
  }, [admin]);

  if (!admin) return null;

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}