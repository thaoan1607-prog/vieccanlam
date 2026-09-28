import React, { useState } from 'react';
import { Plus, Sparkles, HelpCircle, Loader2, ArrowRight, Lightbulb, Clock } from 'lucide-react';
import { Task } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface QuickAddBoxProps {
  onAddTasks: (newTasks: Omit<Task, 'id' | 'createdAt' | 'completed'>[]) => void;
  existingTasks: Task[];
}

export const QuickAddBox: React.FC<QuickAddBoxProps> = ({ onAddTasks, existingTasks }) => {
  const { themeConfig } = useTheme();
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [freeTime, setFreeTime] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clarifications, setClarifications] = useState<string[]>([]);
  const [comment, setComment] = useState<string | null>(null);

  const samplePrompt = `- Làm bài tiếng Nhật\n- Mua đồ ăn cho chó\n- Gửi email cho cô\n- Dọn phòng\n- Học từ vựng N3\n- Gọi điện cho mẹ\n- Làm bài tập trước thứ 6`;

  const handleSimpleAdd = () => {
    if (!inputVal.trim()) return;

    const lines = inputVal
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((l) => l.length > 0);

    const created: Omit<Task, 'id' | 'createdAt' | 'completed'>[] = lines.map((line) => {
      const lower = line.toLowerCase();
      let priority: Task['priority'] = 'medium_important';
      let isSomeday = false;

      if (lower.includes('trước') || lower.includes('gấp') || lower.includes('deadline')) {
        priority = 'high_urgent';
      } else if (lower.includes('ý tưởng') || lower.includes('để sau') || lower.includes('muốn')) {
        priority = 'someday_idea';
        isSomeday = true;
      } else if (lower.length < 25 && (lower.includes('mua') || lower.includes('gọi') || lower.includes('dọn'))) {
        priority = 'quick_task';
      }

      return {
        title: line,
        priority,
        estimatedDuration: priority === 'quick_task' ? '15 phút' : '30 phút',
        timeOfDay: 'morning',
        isSomeday,
        notes: '',
      };
    });

    onAddTasks(created);
    setInputVal('');
    setClarifications([]);
    setComment(null);
  };

  const handleAiClassify = async () => {
    if (!inputVal.trim()) return;

    setIsProcessing(true);
    setClarifications([]);
    setComment(null);

    try {
      const res = await fetch('/api/ai/parse-and-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputVal,
          existingTasks,
          freeTime,
        }),
      });

      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        onAddTasks(data.tasks);
        setInputVal('');
        if (data.clarificationQuestions && data.clarificationQuestions.length > 0) {
          setClarifications(data.clarificationQuestions);
        }
        if (data.summaryComment) {
          setComment(data.summaryComment);
        }
      } else {
        handleSimpleAdd();
      }
    } catch (err) {
      console.error('Failed to parse with AI:', err);
      handleSimpleAdd();
    } finally {
      setIsProcessing(false);
    }
  };

  const fillSample = () => {
    setInputVal(samplePrompt);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Input container */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <label htmlFor="quick-task-input" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>Hôm nay bạn cần làm gì?</span>
            <span className="text-xs font-normal text-slate-400">(nhập tự do, AI sẽ giúp bạn sắp xếp)</span>
          </label>
          <button
            onClick={fillSample}
            type="button"
            className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-950/70 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 border border-pink-200/60 dark:border-pink-800/50"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Thử ví dụ mẫu</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            id="quick-task-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAiClassify();
              }
            }}
            placeholder="Ví dụ:
- Làm bài tiếng Nhật
- Mua đồ ăn cho chó
- Gửi email cho cô
- Dọn phòng
- Học từ vựng N3
- Gọi điện cho mẹ
- Làm bài tập trước thứ 6..."
            rows={4}
            className="w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-y min-h-[110px]"
          />
        </div>

        {/* Optional Time Availability toggler */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{showAdvanced ? 'Ẩn thời gian rảnh' : '+ Thêm thời gian rảnh để AI Time-Blocking'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 animate-in fade-in">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Thời gian bạn rảnh hôm nay (ví dụ: 08:00 - 12:00 và 13:30 - 17:30):
              </label>
              <input
                type="text"
                value={freeTime}
                onChange={(e) => setFreeTime(e.target.value)}
                placeholder="Nếu để trống, AI sẽ chia theo Buổi sáng, Buổi trưa, Buổi chiều, Buổi tối"
                className="w-full text-xs sm:text-sm px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            Mẹo: Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-[11px] font-mono">Ctrl + Enter</kbd> để phân loại nhanh
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleSimpleAdd}
              disabled={!inputVal.trim() || isProcessing}
              type="button"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm công việc</span>
            </button>

            <button
              onClick={handleAiClassify}
              disabled={!inputVal.trim() || isProcessing}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2 active:scale-95 bg-gradient-to-r ${themeConfig.gradientClass}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI đang phân loại...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Phân loại & Sắp xếp</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Comment & Clarifications (if any) */}
      {(comment || clarifications.length > 0) && (
        <div className="bg-pink-50/60 dark:bg-pink-950/30 border-t border-pink-100 dark:border-pink-900/40 px-4 py-3 sm:px-6">
          {comment && (
            <p className="text-xs sm:text-sm font-medium text-pink-900 dark:text-pink-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
              <span>{comment}</span>
            </p>
          )}

          {clarifications.length > 0 && (
            <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
              <div className="font-semibold flex items-center gap-1 mb-1 text-amber-800 dark:text-amber-200">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>AI cần làm rõ thêm để lập lịch chuẩn xác:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {clarifications.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
