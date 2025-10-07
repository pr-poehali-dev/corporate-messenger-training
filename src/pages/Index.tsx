import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  deadline: string;
  member_count: number;
  admin_name: string;
}

interface Message {
  id: number;
  content: string;
  user_name: string;
  user_role: string;
  file_name: string | null;
  created_at: string;
}

interface Debtor {
  id: number;
  user_name: string;
  description: string;
  amount: number;
  group_name?: string;
}

const API_BASE = {
  auth: 'https://functions.poehali.dev/424527bc-6d48-4e3b-809c-472637ba6e29',
  groups: 'https://functions.poehali.dev/53cf5ceb-8834-4a1f-9085-9bbd12c4de0f',
  messages: 'https://functions.poehali.dev/8c6171ee-938f-4dae-8653-fde6f29c439a',
  debtors: 'https://functions.poehali.dev/ceecc39c-9d00-4f7a-9f16-b5a0fbfb85d8',
};

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'groups' | 'debtors' | 'profile'>('home');
  const [groups, setGroups] = useState<Group[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState('student');

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupDeadline, setNewGroupDeadline] = useState('');

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchDebtors();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup);
      const interval = setInterval(() => fetchMessages(selectedGroup), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

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

  const fetchMessages = async (groupId: number) => {
    try {
      const response = await fetch(`${API_BASE.messages}?group_id=${groupId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(API_BASE.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        toast({ title: 'Успешный вход!' });
      } else {
        toast({ title: 'Неверные данные', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка входа', variant: 'destructive' });
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(API_BASE.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: registerEmail,
          password: registerPassword,
          full_name: registerName,
          role: registerRole,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        toast({ title: 'Регистрация успешна!' });
      }
    } catch (error) {
      toast({ title: 'Ошибка регистрации', variant: 'destructive' });
    }
  };

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
        fetchGroups();
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

  const handleSendMessage = async () => {
    if (!user || !selectedGroup || !newMessage.trim()) return;
    try {
      await fetch(API_BASE.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: selectedGroup,
          user_id: user.id,
          content: newMessage,
        }),
      });
      setNewMessage('');
      fetchMessages(selectedGroup);
    } catch (error) {
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Образовательный мессенджер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="teacher@school.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Войти
                </Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="reg-name">Полное имя</Label>
                  <Input
                    id="reg-name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="student@school.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Роль</Label>
                  <select
                    id="role"
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="student">Ученик</option>
                    <option value="admin">Учитель</option>
                  </select>
                </div>
                <Button onClick={handleRegister} className="w-full">
                  Зарегистрироваться
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Образовательный мессенджер</h1>
          <div className="flex gap-6 items-center">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 ${currentView === 'home' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <Icon name="Home" size={20} />
              Главная
            </button>
            <button
              onClick={() => setCurrentView('groups')}
              className={`flex items-center gap-2 ${currentView === 'groups' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <Icon name="Users" size={20} />
              Группы
            </button>
            <button
              onClick={() => setCurrentView('debtors')}
              className={`flex items-center gap-2 ${currentView === 'debtors' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <Icon name="AlertCircle" size={20} />
              Должники
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-2 ${currentView === 'profile' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <Icon name="User" size={20} />
              {user.full_name}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {currentView === 'home' && (
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
                <p className="text-4xl font-bold text-accent">{groups.filter(g => g.member_count > 0).length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'groups' && (
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
                      onClick={() => setSelectedGroup(group.id)}
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
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Чат группы</span>
                      <Button onClick={() => handleJoinGroup(selectedGroup)} size="sm">
                        Вступить
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.user_role === 'admin' ? 'bg-primary/10 border-l-4 border-primary' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{msg.user_name}</span>
                            {msg.user_role === 'admin' && (
                              <Badge variant="default" className="text-xs">
                                Учитель
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                          {msg.file_name && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                              <Icon name="Paperclip" size={14} />
                              {msg.file_name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Введите сообщение..."
                      />
                      <Button onClick={handleSendMessage}>
                        <Icon name="Send" size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
        )}

        {currentView === 'debtors' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={24} className="text-destructive" />
                Система учета должников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debtors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Должников нет</p>
                ) : (
                  debtors.map((debtor) => (
                    <div key={debtor.id} className="p-4 border rounded-lg bg-destructive/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon name="User" size={20} className="text-destructive" />
                          <div>
                            <h3 className="font-semibold">{debtor.user_name}</h3>
                            {debtor.group_name && (
                              <p className="text-sm text-muted-foreground">{debtor.group_name}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="destructive">{debtor.amount} задолженность</Badge>
                      </div>
                      <p className="text-sm">{debtor.description}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === 'profile' && (
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
              <Button onClick={() => setUser(null)} variant="outline" className="w-full">
                Выйти
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}