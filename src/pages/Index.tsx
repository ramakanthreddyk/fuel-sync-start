import React from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Dashboard from './Dashboard';
import DataEntry from './DataEntry';
import Sales from './Sales';
import Prices from './Prices';
import Pumps from './Pumps';
import Reports from './Reports';
import Settings from './Settings';
import DailyClosure from './DailyClosure';
import Staff from './Staff';

const Index = () => {
  const location = useLocation();
  
  const renderPage = () => {
    switch (location.pathname) {
      // Point old and new routes to DataEntry (backward compatible)
      case '/data-entry':
      case '/upload':
        return <DataEntry />;
      case '/sales':
        return <Sales />;
      case '/prices':
        return <Prices />;
      case '/pumps':
        return <Pumps />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      case '/daily-closure':
        return <DailyClosure />;
      case '/staff':
        return <Staff />;
      case '/dashboard':
      case '/':
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout>
      {renderPage()}
    </AppLayout>
  );
};

export default Index;
