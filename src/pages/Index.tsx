import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, Group, Debtor, API_BASE } from '@/components/messenger/types';
import AuthForm from '@/components/messenger/AuthForm';
import Navigation from '@/components/messenger/Navigation';
import HomePage from '@/components/messenger/HomePage';
import GroupsPage from '@/components/messenger/GroupsPage';
import DebtorsPage from '@/components/messenger/DebtorsPage';
import ProfilePage from '@/components/messenger/ProfilePage';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'groups' | 'debtors' | 'profile'>('home');
  const [groups, setGroups] = useState<Group[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchDebtors();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(API_BASE.groups);
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      toast({ title: 'Ошибка загрузки групп', variant: 'destructive' });
    }
  };

  const fetchDebtors = async () => {
    try {
      const response = await fetch(API_BASE.debtors);
      const data = await response.json();
      setDebtors(data.debtors || []);
    } catch (error) {
      toast({ title: 'Ошибка загрузки должников', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} currentView={currentView} onViewChange={setCurrentView} />
      <div className="max-w-7xl mx-auto p-6">
        {currentView === 'home' && <HomePage groups={groups} debtors={debtors} />}
        {currentView === 'groups' && <GroupsPage user={user} groups={groups} onGroupsUpdate={fetchGroups} />}
        {currentView === 'debtors' && <DebtorsPage debtors={debtors} />}
        {currentView === 'profile' && <ProfilePage user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
