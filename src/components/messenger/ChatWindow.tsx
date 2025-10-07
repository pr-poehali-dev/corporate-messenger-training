import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { User, Message, API_BASE } from './types';

interface ChatWindowProps {
  user: User;
  selectedGroup: number;
  messages: Message[];
  onJoinGroup: (groupId: number) => void;
  onMessagesUpdate: () => void;
}

export default function ChatWindow({
  user,
  selectedGroup,
  messages,
  onJoinGroup,
  onMessagesUpdate,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedGroup) {
      onMessagesUpdate();
      const interval = setInterval(() => onMessagesUpdate(), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedGroup, onMessagesUpdate]);

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
      onMessagesUpdate();
    } catch (error) {
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Чат группы</span>
          <Button onClick={() => onJoinGroup(selectedGroup)} size="sm">
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
  );
}
