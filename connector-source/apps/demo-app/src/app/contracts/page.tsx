import React from 'react';
import { ContractDashboard } from '../../components/ContractDashboard';

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ContractDashboard serverUrl={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'} />
    </div>
  );
}
