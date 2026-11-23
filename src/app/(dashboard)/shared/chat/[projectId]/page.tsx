'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getChatMessagesAction, sendMessageAction, type ChatMessage } from '@/actions/chat';
import { getProjectByIdAction } from '@/actions/projects';
import type { Project } from '@/types/database.types';
import {
  Send,
  ArrowLeft,
  Paperclip,
  ShieldCheck,
  CheckCheck,
  Check,
  Lock,
  MessageSquare,
} from 'lucide-react';

export default function RealtimeChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      setIsLoading(true);
      const [projRes, chatRes] = await Promise.all([
        getProjectByIdAction(projectId),
        getChatMessagesAction(projectId),
      ]);

      if (projRes.success && projRes.project) {
        setProject(projRes.project);
      }
      if (chatRes.success && chatRes.messages) {
        setMessages(chatRes.messages);
      }
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }

    loadData();

    // Setup Supabase Realtime WebSocket channel
    const channel = supabase
      .channel(`chat_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSending) return;

    const messageText = content.trim();
    setContent('');
    setIsSending(true);

    try {
      const res = await sendMessageAction({
        project_id: projectId,
        content: messageText,
      });

      if (!res.success) {
        toast({
          type: 'error',
          title: 'Gagal Mengirim Pesan',
          message: res.error,
        });
        setContent(messageText); // restore
        return;
      }

      if (res.message) {
        setMessages((prev) => [...prev, res.message!]);
      }
    } catch {
      toast({
        type: 'error',
        title: 'Kesalahan Jaringan',
        message: 'Gagal mengirim pesan.',
      });
      setContent(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-md border border-gray-200 bg-white shadow-card overflow-hidden">
      {/* Top Chat Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-forest-50/40 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded p-1 text-gray-500 hover:bg-forest-100/60 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                {project ? project.title : 'Ruang Diskusi Akademik'}
              </h2>
              <Badge variant="forest" size="sm">
                Proyek Aktif
              </Badge>
            </div>
            <p className="text-[11px] text-gray-500">
              Kanal terenkripsi &bull; Dimas Pratama (Klien) & Dr. Hendra Wijaya (Joki)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-forest-800 bg-forest-50 px-3 py-1.5 rounded-md border border-forest-200">
          <ShieldCheck className="h-4 w-4 text-forest-700" />
          <span className="font-semibold text-[11px]">Rekber Escrow Aktif</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-muted/50">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 border border-forest-100 px-3 py-1 text-[11px] text-forest-800">
            <Lock className="h-3 w-3" />
            <span>Pesan dan pertukaran dokumen dilindungi kebijakan privasi akademik.</span>
          </div>
        </div>

        {messages.map((msg) => {
          // In testing session, consider messages from 'buyer' or 'user-buyer-1' as outgoing
          const isMe = msg.sender_id === 'user-buyer-1' || msg.sender_role === 'buyer';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold px-1">
                <span>{msg.sender_name}</span>
                <span className="capitalize text-gray-500">({msg.sender_role})</span>
              </div>

              <div
                className={`max-w-md sm:max-w-lg rounded-md px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-forest-800 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                <div
                  className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                    isMe ? 'text-forest-200' : 'text-gray-400'
                  }`}
                >
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <CheckCheck className="h-3.5 w-3.5 text-forest-300" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3 sm:p-4"
      >
        <button
          type="button"
          onClick={() =>
            toast({
              type: 'info',
              title: 'Lampiran Dokumen',
              message: 'Silakan gunakan Document Portal untuk mengunggah draf bab terenkripsi.',
            })
          }
          className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Lampirkan Dokumen"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan ke rekan bimbingan... (Tekan Enter untuk kirim)"
          className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600 max-h-24"
        />

        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={!content.trim() || isSending}
          isLoading={isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
