import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Debtor } from './types';

interface DebtorsPageProps {
  debtors: Debtor[];
}

export default function DebtorsPage({ debtors }: DebtorsPageProps) {
  return (
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
  );
}
