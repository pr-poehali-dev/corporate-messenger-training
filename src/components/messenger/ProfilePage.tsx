import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User } from './types';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль пользователя</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Имя</Label>
          <p className="text-lg font-semibold">{user.full_name}</p>
        </div>
        <div>
          <Label>Email</Label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <Label>Роль</Label>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role === 'admin' ? 'Учитель' : 'Ученик'}
          </Badge>
        </div>
        <Button onClick={onLogout} variant="outline" className="w-full">
          Выйти
        </Button>
      </CardContent>
    </Card>
  );
}
