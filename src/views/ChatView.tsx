import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { ChatMessage } from '@/lib/types';
import { Send, Sparkles, Loader2, BookOpen, Upload, X, FileText, Compass } from 'lucide-react';

interface ChatViewProps {
  projectId: string | null;
}

const COLD_START_QUESTIONS = [
  "Tell me about the story you keep meaning to write.",
  "Is there a character you've been thinking about for a long time?",
  "What's the image or moment your story starts from for you?",
  "What's the feeling you want someone to have when they finish reading it?",
];

const GENRE_OPTIONS = [
  { value: 'literary', label: 'Literary Fiction', desc: 'Character-driven, psychologically rich' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Magic systems, world-building, epic scope' },
  { value: 'scifi', label: 'Science Fiction', desc: 'What-if premises, technology, philosophy' },
  { value: 'mystery', label: 'Mystery / Crime', desc: 'Investigation, information asymmetry, reveals' },
  { value: 'romance', label: 'Romance', desc: 'Relationship arcs, emotional beats, connection' },
  { value: 'horror', label: 'Horror', desc: "Dread, the unknown, what shouldn't be" },
  { value: 'thriller', label: 'Thriller', desc: 'Ticking clock, escalating stakes, propulsion' },
  { value: 'pulp', label: 'Pulp / Action', desc: 'Fast, fun, set pieces, momentum' },
  { value: 'historical', label: 'Historical Fiction', desc: 'Period accuracy, social constraints, power' },
  { value: 'ya', label: 'Young Adult', desc: 'Identity, belonging, authority vs. self' },
  { value: 'memoir', label: 'Memoir / Narrative', desc: 'Retrospection, voice, truth through telling' },
  { value: 'screenplay', label: 'Screenplay / Film', desc: 'Visual storytelling, page-count structure' },
  { value: 'general', label: 'General / Not Sure Yet', desc: 'Flexible — let the AI adapt to your material' },
];

const ACCEPTED_TYPES = '.txt,.md,.markdown,.rtf,.doc,.docx';
const MAX_FILE_SIZE = 500_000;

export function ChatView({ projectId }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreSaved, setGenreSaved] = useState(false);
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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
      return;
    }

    setMessages((data as ChatMessage[]) || []);
    setLoading(false);

    if (projectId) {
      const { data: proj } = await supabase
        .from('projects')
        .select('genre')
        .eq('id', projectId)
        .maybeSingle();
      if (proj?.genre) {
        setSelectedGenre(proj.genre);
        setGenreSaved(true);
      }
    }
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
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
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
      let text = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        text = await file.text();
      } else {
        text = await file.text();
      }
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

    const summary = importFileName
      ? `Imported "${importFileName}" — here's what I found:`
      : "Imported your document — here's what I found:";

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
            importSummary: summary,
          },
        })
        .select('*')
        .maybeSingle();

      if (savedAi) {
        setMessages((prev) => [...prev, savedAi as ChatMessage]);
      }

      setImportText('');
      setImportFileName('');
    } catch (err) {
      setError(err.message || 'Import failed');
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
  const showGenrePicker = isEmpty && !genreSaved;

  const handleGenreSelect = async (genreValue: string) => {
    setSelectedGenre(genreValue);
    if (projectId) {
      await supabase
        .from('projects')
        .update({ genre: genreValue, updated_at: new Date().toISOString() })
        .eq('id', projectId);
    }
    setGenreSaved(true);
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-ink-200 dark:border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-serif font-semibold text-ink-800 dark:text-ink-100">Story Chat</h2>
            <p className="text-xs text-ink-400 dark:text-ink-500">Your AI writing partner — ask questions, build your story naturally</p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="btn btn-secondary !py-2 !px-3 text-xs gap-1.5"
            title="Import an existing document"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4">
        {showGenrePicker && (
          <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-ink-700 dark:text-ink-200 mb-2">What kind of story are you writing?</h3>
            <p className="text-sm text-ink-400 dark:text-ink-500 max-w-md mb-6">
              This helps me ask the right questions. I won't force conventions — I'll just know what matters most for your kind of story.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {GENRE_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleGenreSelect(g.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    selectedGenre === g.value
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-ink-200 dark:border-ink-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                  }`}
                >
                  <div className="text-sm font-medium text-ink-700 dark:text-ink-200">{g.label}</div>
                  <div className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isEmpty && genreSaved && (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-ink-700 dark:text-ink-200 mb-2">Let's build your story</h3>
            <p className="text-sm text-ink-400 dark:text-ink-500 max-w-md mb-6">
              I'll ask you questions one at a time. There are no wrong answers — just tell me what comes to mind, and I'll shape the story from there.
            </p>
            <div className="grid gap-2 w-full max-w-md">
              {COLD_START_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-sm text-ink-600 dark:text-ink-400 px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowImport(true)}
              className="mt-4 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Or import an existing document
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
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
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
            placeholder="Tell me about your story..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 placeholder-ink-300 dark:placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 max-h-32"
            style={{ minHeight: '48px' }}
            disabled={sending || importing}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending || importing}
            className="btn btn-primary !rounded-xl !px-4 !py-3 shrink-0 bg-ink-800 hover:bg-ink-700 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-white"
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
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-ink-800 dark:text-ink-100">Import a Document</h3>
                  <p className="text-xs text-ink-400 dark:text-ink-500">Upload an outline, character notes, world-building doc, or any existing work</p>
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
              className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all duration-200 mb-4"
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
              placeholder="Paste your outline, notes, or any existing story material here..."
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
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Extract & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
