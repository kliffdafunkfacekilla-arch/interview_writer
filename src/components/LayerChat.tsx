import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';
import { Send, Loader2, MessageCircle, Upload, X, Sparkles } from 'lucide-react';

export type LayerMode = 'characters' | 'relationships' | 'plot' | 'meaning' | 'style' | 'world';

interface LayerChatProps {
  projectId: string;
  mode: LayerMode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  coldStartQuestions: string[];
  onDataExtracted?: () => void;
}

const ACCEPTED_TYPES = '.txt,.md,.markdown,.rtf,.doc,.docx';
const MAX_FILE_SIZE = 500_000;

export function LayerChat({
  projectId,
  mode,
  title,
  subtitle,
  icon,
  accentColor,
  coldStartQuestions,
  onDataExtracted,
}: LayerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', mode)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
      return;
    }

    setMessages((data as ChatMessage[]) || []);
    setLoading(false);
  }, [projectId, mode]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const callAI = async (conversationHistory: { role: string; content: string }[], importContent?: string) => {
    const apiUrl = `${SUPABASE_URL}/functions/v1/ai-story-chat`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        projectId,
        messages: conversationHistory,
        mode,
        ...(importContent ? { importText: importContent } : {}),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errData.error || `Request failed (${res.status})`);
    }

    const aiResponse = await res.json();
    if (aiResponse.error) {
      throw new Error(aiResponse.error);
    }

    return aiResponse;
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userContent = input.trim();
    setInput('');
    setSending(true);
    setError(null);

    const optimisticUser: ChatMessage = {
      id: 'temp-' + Date.now(),
      project_id: projectId,
      role: 'user',
      content: userContent,
      data: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const { data: savedUser } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          role: 'user',
          content: userContent,
          data: {},
          category: mode,
        })
        .select('*')
        .maybeSingle();

      if (savedUser) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticUser.id ? savedUser as ChatMessage : m)),
        );
      }

      const conversationHistory = [
        ...messages
          .filter((m) => m.id !== optimisticUser.id)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userContent },
      ];

      const aiResponse = await callAI(conversationHistory);

      const { data: savedAi } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          role: 'assistant',
          content: aiResponse.reply,
          data: {
            extracted: aiResponse.extracted || [],
            energy: aiResponse.energy || 'medium',
          },
          category: mode,
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
      }

      if (aiResponse.extracted?.length > 0 && onDataExtracted) {
        onDataExtracted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (max ${Math.round(MAX_FILE_SIZE / 1000)}KB). Try pasting the content instead.`);
      return;
    }

    try {
      const text = await file.text();
      setImportText(text);
      setImportFileName(file.name);
    } catch {
      setError('Could not read this file. Try pasting the content directly.');
    }
  };

  const handleImport = async () => {
    if (!importText.trim() || importing) return;

    setShowImport(false);
    setImporting(true);
    setError(null);

    const optimisticUser: ChatMessage = {
      id: 'temp-import-' + Date.now(),
      project_id: projectId,
      role: 'user',
      content: `[Document Import: ${importFileName || 'pasted text'}]`,
      data: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const { data: savedUser } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          role: 'user',
          content: `[Document Import: ${importFileName || 'pasted text'}]`,
          data: {},
          category: mode,
        })
        .select('*')
        .maybeSingle();

      if (savedUser) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticUser.id ? savedUser as ChatMessage : m)),
        );
      }

      const aiResponse = await callAI([], importText.trim());

      const { data: savedAi } = await supabase
        .from('chat_messages')
        .insert({
          project_id: projectId,
          role: 'assistant',
          content: aiResponse.reply,
          data: {
            extracted: aiResponse.extracted || [],
            energy: aiResponse.energy || 'medium',
          },
          category: mode,
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
      }

      if (aiResponse.extracted?.length > 0 && onDataExtracted) {
        onDataExtracted();
      }

      setImportText('');
      setImportFileName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setImporting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-ink-400 dark:text-ink-500">Loading conversation...</div>
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-200 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl ${accentColor} flex items-center justify-center`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-serif font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
            <p className="text-xs text-ink-400 dark:text-ink-500">{subtitle}</p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-secondary !py-2 !px-3 text-xs gap-1.5"
            title="Import material"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className={`w-16 h-16 rounded-2xl ${accentColor} flex items-center justify-center mb-4`}>
              {icon}
            </div>
            <h3 className="text-lg font-serif font-semibold text-ink-700 dark:text-ink-200 mb-2">Let's build this together</h3>
            <p className="text-sm text-ink-400 dark:text-ink-500 max-w-md mb-6">
              I'll ask you one question at a time. Just describe what comes to mind — I'll shape the details from there.
            </p>
            <div className="space-y-2 max-w-md w-full">
              {coldStartQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition-all duration-200 text-sm text-ink-500 dark:text-ink-400"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-ink-700 text-ink-50'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.data?.extracted && msg.data.extracted.length > 0 && (
                <div className="mt-2 pt-2 border-t border-ink-600/30 flex items-center gap-1.5 text-xs text-ink-300">
                  <Sparkles className="w-3 h-3" />
                  {msg.data.extracted.length} item{msg.data.extracted.length !== 1 ? 's' : ''} saved
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-ink-100 dark:bg-ink-800 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-ink-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-ink-200 dark:border-ink-800">
        {error && (
          <div className="mb-2 text-xs text-error-500 bg-error-50 dark:bg-error-900/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            className="input flex-1 resize-none"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="btn btn-primary shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={() => setShowImport(false)}
        >
          <div
            className="card w-full max-w-lg mx-4 p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-semibold text-ink-800 dark:text-ink-100">Import Material</h3>
              <button onClick={() => setShowImport(false)} className="btn-ghost btn !p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-ink-400 dark:text-ink-500 mb-4">
              Paste text or upload a file. The AI will extract relevant data and ask a follow-up.
            </p>
            <textarea
              className="input mb-3"
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your content here..."
            />
            <div className="flex items-center gap-2 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </button>
              {importFileName && (
                <span className="text-sm text-ink-500 truncate">{importFileName}</span>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowImport(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={!importText.trim() || importing}
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Import & Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
