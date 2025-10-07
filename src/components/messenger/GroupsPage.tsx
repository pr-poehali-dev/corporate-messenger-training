import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { User, Group, Message, API_BASE } from './types';
import ChatWindow from './ChatWindow';

interface GroupsPageProps {
  user: User;
  groups: Group[];
  onGroupsUpdate: () => void;
}

export default function GroupsPage({ user, groups, onGroupsUpdate }: GroupsPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupDeadline, setNewGroupDeadline] = useState('');
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!user) return;
    try {
      const response = await fetch(API_BASE.groups, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          admin_id: user.id,
          deadline: newGroupDeadline,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Группа создана!' });
        onGroupsUpdate();
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupDeadline('');
      }
    } catch (error) {
      toast({ title: 'Ошибка создания группы', variant: 'destructive' });
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    if (!user) return;
    try {
      await fetch(API_BASE.groups, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          group_id: groupId,
          user_id: user.id,
        }),
      });
      toast({ title: 'Вы вступили в группу!' });
    } catch (error) {
      toast({ title: 'Ошибка вступления', variant: 'destructive' });
    }
  };

  const fetchMessages = async (groupId: number) => {
    try {
      const response = await fetch(`${API_BASE.messages}?group_id=${groupId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages');
    }
  };

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroup(groupId);
    fetchMessages(groupId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        {user.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Создать группу</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Python Курс"
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Основы программирования"
                />
              </div>
              <div>
                <Label>Дедлайн</Label>
                <Input
                  type="datetime-local"
                  value={newGroupDeadline}
                  onChange={(e) => setNewGroupDeadline(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Создать
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Список групп</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupSelect(group.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedGroup === group.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  <Badge variant="secondary">{group.member_count}</Badge>
                </div>
                <p className="text-sm opacity-90">{group.description}</p>
                {group.deadline && (
                  <p className="text-xs mt-2 opacity-75">
                    <Icon name="Clock" size={12} className="inline mr-1" />
                    {new Date(group.deadline).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {selectedGroup ? (
          <ChatWindow
            user={user}
            selectedGroup={selectedGroup}
            messages={messages}
            onJoinGroup={handleJoinGroup}
            onMessagesUpdate={() => fetchMessages(selectedGroup)}
          />
        ) : (
          <Card className="h-[600px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Выберите группу для начала общения</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
