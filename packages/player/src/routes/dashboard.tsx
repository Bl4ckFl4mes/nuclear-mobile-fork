import { createFileRoute } from '@tanstack/react-router';
import { type FC } from 'react';

import { useIsMobilePlatform } from '@nuclearplayer/ui';

import { MobileHome } from '../components/MobileHome';
import { Dashboard } from '../views/Dashboard';

const DashboardRoute: FC = () => {
  const isMobile = useIsMobilePlatform();
  return isMobile ? <MobileHome /> : <Dashboard />;
};

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
});
