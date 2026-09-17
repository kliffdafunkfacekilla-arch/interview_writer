import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';
import { Send, Globe, Loader2, Upload, X, FileText, Mountain } from 'lucide-react';

interface WorldChatViewProps {
  projectId: string | null;
}

const WORLD_COLD_START = [
  "When you picture your world, what do you see? Is it a city, a landscape, a planet, a room?",
  "What's the first thing someone visiting this world would notice?",
  "Is this world familiar to ours, or completely alien? What makes it different?",
  "What's the feeling of being in this world — not what it looks like, but what it does to you?",
];

const ACCEPTED_TYPES = '.txt,.md,.markdown,.rtf,.doc,.docx';
const MAX_FILE_SIZE = 500_000;

export function WorldChatView({ projectId }: WorldChatViewProps) {
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
    if (!projectId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', 'world')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
      return;
    }

    setMessages((data as ChatMessage[]) || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const callAI = async (conversationHistory: { role: string; content: string }[], importContent?: string) => {
    if (!projectId) return null;

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
        mode: 'world',
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
    if (!input.trim() || !projectId || sending) return;

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
          category: 'world',
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
          category: 'world',
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
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
    if (!importText.trim() || !projectId || importing) return;

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
          category: 'world',
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
          category: 'world',
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
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
        <div className="animate-pulse text-ink-400 dark:text-ink-500">Loading world chat...</div>
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-ink-200 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
            <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-serif font-semibold text-ink-800 dark:text-ink-100">World Chat</h2>
            <p className="text-xs text-ink-400 dark:text-ink-500">Build your world through conversation — places, laws, histories, and the truth behind them</p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-secondary !py-2 !px-3 text-xs gap-1.5"
            title="Import world-building material"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
              <Mountain className="w-8 h-8 text-teal-500 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-ink-700 dark:text-ink-200 mb-2">Let's build your world</h3>
            <p className="text-sm text-ink-400 dark:text-ink-500 max-w-md mb-6">
              I'll ask you about places, rules, histories, and the truth behind them. Just describe what comes to mind — I'll shape the world from there.
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {WORLD_COLD_START.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-sm text-ink-600 dark:text-ink-400 px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowImport(true)}
              className="mt-4 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Or import existing world-building material
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink-800 text-ink-50 dark:bg-ink-700 dark:text-ink-100 rounded-tr-sm'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-200 rounded-tl-sm'
                }`}
              >
                {msg.content.startsWith('[Document Import:') ? (
                  <div className="flex items-center gap-2 text-ink-400 dark:text-ink-500 italic">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>{msg.content.replace('[Document Import: ', '').replace(']', '')}</span>
                  </div>
                ) : (
                  msg.content
                )}
                {msg.role === 'assistant' && msg.data?.extracted && msg.data.extracted.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-ink-200/50 dark:border-ink-700/50">
                    <p className="text-xs text-ink-500 dark:text-ink-500 italic">
                      Saved to {msg.data.extracted.map((e) => e.table.replace('_', ' ')).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {(sending || importing) && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <Loader2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-ink-100 dark:bg-ink-800">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-ink-400 dark:bg-ink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-400 dark:bg-ink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-400 dark:bg-ink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center animate-fade-in">
            <div className="px-4 py-2.5 rounded-xl bg-error-50 dark:bg-error-900/30 text-error-600 dark:text-error-400 text-xs text-center max-w-md">
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-ink-200 dark:border-ink-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me about your world..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 placeholder-ink-300 dark:placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 max-h-32"
            style={{ minHeight: '48px' }}
            disabled={sending || importing}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending || importing}
            className="btn btn-primary !rounded-xl !px-4 !py-3 shrink-0 bg-ink-800 hover:bg-ink-700 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-600 mt-2 text-center">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={() => setShowImport(false)}>
          <div
            className="card w-full max-w-lg mx-4 p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-ink-800 dark:text-ink-100">Import World Material</h3>
                  <p className="text-xs text-ink-400 dark:text-ink-500">Upload a setting bible, world notes, location descriptions, or any world-building work</p>
                </div>
              </div>
              <button
                onClick={() => setShowImport(false)}
                className="btn-ghost !p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all duration-200 mb-4"
            >
              <FileText className="w-8 h-8 text-ink-300 dark:text-ink-600 mx-auto mb-2" />
              <p className="text-sm text-ink-600 dark:text-ink-300 font-medium">
                {importFileName ? importFileName : 'Click to upload a file'}
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                {importFileName ? 'Click to replace' : 'TXT, Markdown, RTF, or DOC — up to 500KB'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="text-center text-xs text-ink-400 dark:text-ink-500 mb-3">or paste text below</div>

            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                if (e.target.value && importFileName) setImportFileName('');
              }}
              placeholder="Paste your world notes, setting descriptions, magic system rules, histories..."
              rows={6}
              className="input resize-y text-sm leading-relaxed mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportText('');
                  setImportFileName('');
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim() || importing}
                className="btn btn-primary"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Extract & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
