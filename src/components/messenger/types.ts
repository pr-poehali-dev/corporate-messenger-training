export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  deadline: string;
  member_count: number;
  admin_name: string;
}

export interface Message {
  id: number;
  content: string;
  user_name: string;
  user_role: string;
  file_name: string | null;
  created_at: string;
}

export interface Debtor {
  id: number;
  user_name: string;
  description: string;
  amount: number;
  group_name?: string;
}

export const API_BASE = {
  auth: 'https://functions.poehali.dev/424527bc-6d48-4e3b-809c-472637ba6e29',
  groups: 'https://functions.poehali.dev/53cf5ceb-8834-4a1f-9085-9bbd12c4de0f',
  messages: 'https://functions.poehali.dev/8c6171ee-938f-4dae-8653-fde6f29c439a',
  debtors: 'https://functions.poehali.dev/ceecc39c-9d00-4f7a-9f16-b5a0fbfb85d8',
};
