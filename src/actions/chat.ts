'use server';

import { createClient } from '@/lib/supabase/server';
import { messageSchema, type MessageInput } from '@/lib/validations/message.schema';
import { revalidatePath } from 'next/cache';

export interface ChatMessage {
  id: string;
  project_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'buyer' | 'seller' | 'admin';
  content: string;
  attachment_url?: string | null;
  is_read: boolean;
  created_at: string;
}

// In-memory messages store starting clean for real user testing
let mockMessages: Record<string, ChatMessage[]> = {};

export async function getChatMessagesAction(projectId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*)')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return { success: true, messages: mockMessages[projectId] || [] };
    }

    return { success: true, messages: data };
  } catch {
    return { success: true, messages: mockMessages[projectId] || [] };
  }
}

export async function sendMessageAction(input: MessageInput) {
  const validated = messageSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Pesan tidak valid.',
    };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const senderId = user?.id || 'user-buyer-1';
  const role = (user?.user_metadata?.role as 'buyer' | 'seller') || 'buyer';
  const senderName = user?.user_metadata?.full_name || 'Dimas Pratama';

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    project_id: validated.data.project_id,
    sender_id: senderId,
    sender_name: senderName,
    sender_role: role,
    content: validated.data.content,
    attachment_url: validated.data.attachment_url,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (!mockMessages[validated.data.project_id]) {
    mockMessages[validated.data.project_id] = [];
  }
  mockMessages[validated.data.project_id].push(newMsg);

  revalidatePath(`/shared/chat/${validated.data.project_id}`);
  return { success: true, message: newMsg };
}
