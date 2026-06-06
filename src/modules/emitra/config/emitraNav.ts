import {
  LayoutDashboard, Users, UserPlus, IndianRupee, Bell, ShieldCheck, FileEdit,
} from 'lucide-react';
import type { NavGroup } from '@/components/layout/DashboardSidebar';

export const emitraNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    items: [
      { path: '/emitra/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/emitra/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Workers',
    defaultOpen: true,
    items: [
      { path: '/emitra/workers/register', icon: UserPlus, label: 'Register Worker' },
      { path: '/emitra/workers', icon: Users, label: 'My Workers' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/emitra/dashboard', icon: IndianRupee, label: 'Earnings' },
      { path: '/emitra/compliance', icon: ShieldCheck, label: 'Compliance' },
      { path: '/partner/onboarding', icon: FileEdit, label: 'My Application' },
    ],
  },
];

export const emitraProfileMenu = [
  { label: 'My Application', icon: FileEdit, path: '/partner/onboarding' },
  { label: 'Compliance', icon: ShieldCheck, path: '/emitra/compliance' },
];
