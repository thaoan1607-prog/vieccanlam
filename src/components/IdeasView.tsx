import React, { useState } from 'react';
import { Lightbulb, Plus, ArrowRight, Trash2, Tag, Sparkles, BookOpen, Briefcase, Compass, User } from 'lucide-react';
import { Idea, Task } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

interface IdeasViewProps {
  ideas: Idea[];
  onAddIdea: (title: string, category: Idea['category'], notes?: string) => void;
  onConvertIdeaToTask: (idea: Idea) => void;
  onDeleteIdea: (id: string) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  onAddIdea,
  onConvertIdeaToTask,
  onDeleteIdea,
}) => {
  const { themeConfig } = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Idea['category']>('personal');
  const [notes, setNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categoryMeta: Record<
    Idea['category'],
    { label: string; icon: React.ReactNode; badgeClass: string }
  > = {
    personal: {
      label: 'Cá nhân',
      icon: <User className="w-3.5 h-3.5" />,
      badgeClass: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    },
    study: {
      label: 'Học tập',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    work: {
      label: 'Công việc',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    future: {
      label: 'Tương lai',
      icon: <Compass className="w-3.5 h-3.5" />,
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddIdea(title.trim(), category, notes.trim());
    setTitle('');
    setNotes('');
  };

  const filteredIdeas = filterCategory === 'all'
    ? ideas
    : ideas.filter((i) => i.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header & Input */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Góc Ý tưởng & Dự định</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                {ideas.length} ý tưởng
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nơi ghi chép mọi suy nghĩ, dự định học hỏi hoặc ước mơ. Khi sẵn sàng, bấm “Chuyển thành công việc” để đưa vào kế hoạch!
            </p>
          </div>
        </div>

        {/* Add Idea Form */}
        <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập ý tưởng mới (ví dụ: Ý tưởng làm bài thuyết trình, Muốn học thêm Kanji...)"
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-pink-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Idea['category'])}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="personal">👤 Ý tưởng cá nhân</option>
              <option value="study">📚 Ý tưởng học tập</option>
              <option value="work">💼 Ý tưởng công việc</option>
              <option value="future">🧭 Việc trong tương lai</option>
            </select>

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xs shrink-0 flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r ${themeConfig.gradientClass}`}
            >
              <Plus className="w-4 h-4" />
              <span>Lưu ý tưởng</span>
            </button>
          </div>
        </form>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tất cả ({ideas.length})
          </button>
          {(Object.keys(categoryMeta) as Idea['category'][]).map((catKey) => {
            const meta = categoryMeta[catKey];
            const count = ideas.filter((i) => i.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setFilterCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  filterCategory === catKey
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
            <p className="text-xs text-slate-400">Chưa có ý tưởng nào trong mục này.</p>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const meta = categoryMeta[idea.category] || categoryMeta.personal;
            return (
              <div
                key={idea.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${meta.badgeClass}`}>
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>

                    <button
                      onClick={() => onDeleteIdea(idea.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                      title="Xóa ý tưởng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {idea.title}
                  </h4>
                  {idea.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">
                      {idea.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(idea.createdAt).toLocaleDateString('vi-VN')}
                  </span>

                  <button
                    onClick={() => onConvertIdeaToTask(idea)}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-pink-800 flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                  >
                    <span>Chuyển thành công việc</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
