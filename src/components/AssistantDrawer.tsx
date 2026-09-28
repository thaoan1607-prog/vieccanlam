import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Plus, Bot, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { Task, ChatMessage } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (newTasks: Omit<Task, 'id' | 'createdAt' | 'completed'>[]) => void;
  currentTasks: Task[];
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  onAddTasks,
  currentTasks,
}) => {
  const { themeConfig } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào bạn! Tôi là **Trợ lý hôm nay** 🌟\n\nBạn không cần phải nhớ mọi thứ trong đầu hay viết theo thứ tự. Hãy thoải mái chia sẻ những gì bạn đang nghĩ (ví dụ: *"Tôi phải học tiếng Nhật, làm bài tập, dọn phòng và mua đồ"*), tôi sẽ giúp bạn biến chúng thành danh sách công việc rõ ràng, dễ làm!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Hôm nay tôi phải làm rất nhiều việc',
        'Tôi cần học tiếng Nhật và làm bài tập',
        'Gợi ý cách sắp xếp việc hôm nay',
      ],
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [addedTaskSets, setAddedTaskSets] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputVal).trim();
    if (!content || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          currentTasks,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Tôi đã ghi nhận suy nghĩ của bạn.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedTasks: data.extractedTasks,
        clarificationQuestions: data.clarificationQuestions,
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Xin lỗi, có lỗi kết nối tạm thời. Bạn vui lòng thử lại nhé!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddExtractedTasks = (msgId: string, tasksToAdd: Omit<Task, 'id' | 'createdAt' | 'completed'>[]) => {
    onAddTasks(tasksToAdd);
    setAddedTaskSets((prev) => ({ ...prev, [msgId]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between shadow-sm bg-gradient-to-r ${themeConfig.gradientClass}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base leading-tight">Trợ lý hôm nay</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </div>
              <p className="text-[11px] text-white/90 font-medium">
                Biến suy nghĩ hỗn độn thành danh sách rõ ràng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[90%]">
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-pink-500 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  {m.content}

                  {/* Clarification questions if present */}
                  {m.clarificationQuestions && m.clarificationQuestions.length > 0 && (
                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                      <div className="font-bold flex items-center gap-1 mb-1 text-amber-800 dark:text-amber-300">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Cần bạn làm rõ thêm:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {m.clarificationQuestions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extracted Tasks preview & Quick add */}
                  {m.extractedTasks && m.extractedTasks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Công việc trích xuất được ({m.extractedTasks.length}):
                      </div>
                      <div className="space-y-1">
                        {m.extractedTasks.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-2"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {t.estimatedDuration}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleAddExtractedTasks(m.id, m.extractedTasks!)}
                        disabled={addedTaskSets[m.id]}
                        type="button"
                        className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          addedTaskSets[m.id]
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 cursor-default'
                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs'
                        }`}
                      >
                        {addedTaskSets[m.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã thêm vào danh sách hôm nay!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm tất cả vào Việc hôm nay</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{m.timestamp}</span>

              {/* Quick actions chips */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                  {m.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSendMessage(action)}
                      type="button"
                      className="px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 text-pink-700 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/50 text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>{action}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-pink-600 dark:text-pink-400 font-semibold p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Trợ lý đang suy nghĩ và sắp xếp...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập suy nghĩ, công việc cần làm..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isSending}
              className="p-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-center">
            Trợ lý tự động giữ nguyên ý nghĩa ban đầu và không suy đoán bừa bãi.
          </p>
        </div>
      </div>
    </div>
  );
};
