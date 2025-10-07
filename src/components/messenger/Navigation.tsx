import Icon from '@/components/ui/icon';
import { User } from './types';

interface NavigationProps {
  user: User;
  currentView: 'home' | 'groups' | 'debtors' | 'profile';
  onViewChange: (view: 'home' | 'groups' | 'debtors' | 'profile') => void;
}

export default function Navigation({ user, currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-border px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Образовательный мессенджер</h1>
        <div className="flex gap-6 items-center">
          <button
            onClick={() => onViewChange('home')}
            className={`flex items-center gap-2 ${currentView === 'home' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            <Icon name="Home" size={20} />
            Главная
          </button>
          <button
            onClick={() => onViewChange('groups')}
            className={`flex items-center gap-2 ${currentView === 'groups' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            <Icon name="Users" size={20} />
            Группы
          </button>
          <button
            onClick={() => onViewChange('debtors')}
            className={`flex items-center gap-2 ${currentView === 'debtors' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            <Icon name="AlertCircle" size={20} />
            Должники
          </button>
          <button
            onClick={() => onViewChange('profile')}
            className={`flex items-center gap-2 ${currentView === 'profile' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            <Icon name="User" size={20} />
            {user.full_name}
          </button>
        </div>
      </div>
    </nav>
  );
}
