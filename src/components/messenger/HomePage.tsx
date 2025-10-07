import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Group, Debtor } from './types';

interface HomePageProps {
  groups: Group[];
  debtors: Debtor[];
}

export default function HomePage({ groups, debtors }: HomePageProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} className="text-primary" />
            Всего групп
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{groups.length}</p>
        </CardContent>
      </Card>
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="AlertCircle" size={24} className="text-destructive" />
            Должников
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-destructive">{debtors.length}</p>
        </CardContent>
      </Card>
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageSquare" size={24} className="text-accent" />
            Активных чатов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-accent">
            {groups.filter((g) => g.member_count > 0).length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
