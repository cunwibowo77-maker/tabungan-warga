/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Toast from './components/Toast';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import WargaList from './pages/WargaList';
import Transactions from './pages/Transactions';
import TargetKasPage from './pages/TargetKas';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';
import KategoriTransactionsPage from './pages/KategoriTransactions';

function InnerApp() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (!user) {
    return (
      <>
        <Login />
        <Toast />
      </>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'warga' && <WargaList />}
      {activeTab === 'transaksi' && <Transactions />}
      {activeTab === 'target' && <TargetKasPage />}
      {activeTab === 'kategori-transaksi' && <KategoriTransactionsPage />}
      {activeTab === 'laporan' && <Reports />}
      {activeTab === 'pengaturan' && <SystemSettings />}
      <Toast />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}
