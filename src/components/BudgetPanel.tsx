import React, { useState } from 'react';
import { Sparkles, HelpCircle, Coins, Calendar, Users, Calculator, Brain, Check, RefreshCw, Milestone, Flame, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Basic markdown-to-html custom parser to render Gemini's beautiful response
function renderCustomMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Escape or format headers
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-display font-bold text-neutral-100 text-sm sm:text-base mt-4 mb-2 flex items-center gap-2 border-b border-white/10 pb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-display font-extrabold text-[#5eff90] text-base sm:text-lg mt-5 mb-3 flex items-center gap-2">
          {line.replace('## ', '')}
        </h3>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={idx} className="font-display font-black text-rose-gold text-lg sm:text-xl mt-6 mb-4">
          {line.replace('# ', '')}
        </h2>
      );
    }
    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const cleanText = line.replace(/^[-*]\s+/, '');
      return (
        <li key={idx} className="text-xs sm:text-sm text-neutral-300 ml-4 list-disc mb-1.5 leading-relaxed">
          {formatBoldText(cleanText)}
        </li>
      );
    }
    // Blockquotes
    if (line.startsWith('> ')) {
      const cleanText = line.replace(/^>\s+/, '');
      return (
        <blockquote key={idx} className="border-l-4 border-emerald-500 bg-white/5 p-3 rounded-r-xl text-xs sm:text-sm text-neutral-300 my-3 italic leading-relaxed">
          {formatBoldText(cleanText)}
        </blockquote>
      );
    }

    if (line.trim() === '') {
      return <div key={idx} className="h-2" />;
    }

    return (
      <p key={idx} className="text-xs sm:text-sm text-neutral-300 mb-2 leading-relaxed">
        {formatBoldText(line)}
      </p>
    );
  });
}

// Convert **bold** annotations to strong tags
function formatBoldText(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-[#fafafa]">{part}</strong>;
    }
    return part;
  });
}

export default function BudgetPanel() {
  const [totalBudget, setTotalBudget] = useState('500000'); // 500k standard standard
  const [days, setDays] = useState('7');
  const [peopleCount, setPeopleCount] = useState('1');
  const [favoriteCategory, setFavoriteCategory] = useState('food');
  const [university, setUniversity] = useState('FPT University');

  // AI response state
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAskAI = async () => {
    setLoadingAI(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/ai-budget-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget: parseFloat(totalBudget),
          days: parseInt(days, 10),
          peopleCount: parseInt(peopleCount, 10),
          favoriteCategory,
          university
        }),
      });
      const data = await response.json();
      if (data.response) {
        setAiResponse(data.response);
      } else {
        setAiResponse("Không tải được tư vấn của Cóc AI. Hãy thử chọn ngân sách khác nhé!");
      }
    } catch (error) {
      console.error(error);
      setAiResponse("Có lỗi xảy ra khi kết nối trợ lý Cóc AI. Bạn hãy thử lại!");
    } finally {
      setLoadingAI(false);
    }
  };

  // Static Local Estimate
  const budgetVal = parseFloat(totalBudget) || 0;
  const daysVal = parseInt(days, 10) || 1;
  const peopleVal = parseInt(peopleCount, 10) || 1;
  const totalPerPerson = budgetVal / peopleVal;
  const dailyPerPerson = totalPerPerson / daysVal;

  // Percentage calculations for track graphics
  const totalPercent = ((budgetVal - 100000) / (3000000 - 100000)) * 100;
  const daysPercent = ((daysVal - 1) / (30 - 1)) * 100;

  // Custom Particles for the 3D Holographic Frog
  const particles = Array.from({ length: 12 });

  return (
    <div className="space-y-6 pb-16 text-white">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="font-display font-black text-2xl text-[#fafafa] tracking-tight flex items-center gap-2">
          💰 Lập Kế Hoạch Budget Sinh Viên & Trợ Lý AI
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium">
          Trải nghiệm tính toán tài chính sinh tồn tối tân, căn chỉnh ngân sách dưới dạng thanh trượt chất lỏng và kích hoạt AI phân bổ bữa ăn thông thái.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: input sliders and configurations (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
          
          <div className="flex items-center gap-2 text-neutral-200 font-extrabold text-xs sm:text-sm uppercase tracking-wider border-b border-white/5 pb-3">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Tham Số Chi Tiêu Thời Gian Thực</span>
          </div>

          {/* Fluid Slider 1: Total money with glowing jade track */}
          <div className="space-y-3 relative">
            <label className="text-xs font-bold text-neutral-300 flex justify-between">
              <span>Tổng ngân sách khả dụng</span>
              <span className="font-extrabold text-[#5eff90] text-sm tracking-tight">{Number(totalBudget).toLocaleString('vi-VN')} đ</span>
            </label>
            <div className="relative w-full flex items-center">
              {/* Glow progress bar segment */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(0,200,83,0.8)] pointer-events-none"
                style={{ width: `${totalPercent}%` }}
              />
              <input 
                type="range"
                min="100000"
                max="3000000"
                step="50000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 select-none outline-none focus:outline-none"
              />
            </div>
          </div>

          {/* Fluid Slider 2: Days with glowing progress bar */}
          <div className="space-y-3 relative">
            <label className="text-xs font-bold text-neutral-300 flex justify-between">
              <span>Thời lượng sinh tồn mong muốn</span>
              <span className="font-extrabold text-teal-400 text-sm">{days} ngày liên tiếp</span>
            </label>
            <div className="relative w-full flex items-center">
              {/* Glow progress bar segment */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(5,150,105,0.8)] pointer-events-none"
                style={{ width: `${daysPercent}%` }}
              />
              <input 
                type="range"
                min="1"
                max="30"
                step="1"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-400 select-none outline-none focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Number of people - Neomorphic design input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400">Số lượng người chia sẻ</label>
              <div className="flex items-center gap-2.5 neo-inset border border-white/5 py-2 px-3.5 rounded-xl">
                <Users className="w-4 h-4 text-neutral-400" />
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  value={peopleCount} 
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-100 font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* University Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400">Ưu tiên vị trí địa lý trường</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-[#161616] border border-white/5 text-xs py-2 px-3 rounded-xl font-bold text-neutral-200 outline-none cursor-pointer"
              >
                <option value="FPT University">FPT University Campus 🎯</option>
                <option value="HUTECH University">HUTECH Khu Công Nghệ Cao ⚡</option>
                <option value="Dai Hoc Bach Khoa">ĐH Bách Khoa Thủ Đức 📚</option>
                <option value="Dai Hoc Nông Lâm">ĐH Nông Lâm 🌲</option>
              </select>
            </div>
          </div>

          {/* Style selector for favorite type of spends */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-400">Ưu tiên cơ cấu phân bổ bữa</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'food', label: 'Cơm / Bún sườn', icon: '🍲' },
                { id: 'drink', label: 'Trà Sữa / Trà Đá', icon: '🥤' },
                { id: 'all', label: 'Dinh Dưỡng Đều', icon: '⚖️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFavoriteCategory(item.id)}
                  className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-extrabold border transition-all duration-300 cursor-pointer ${
                    favoriteCategory === item.id 
                      ? 'bg-white text-neutral-900 border-white shadow-xl scale-102' 
                      : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/5'
                  }`}
                >
                  <div className="text-sm mb-0.5">{item.icon}</div>
                  <div>{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Division metrics */}
          <div className="pt-4 border-t border-white/5 space-y-2.5 text-xs bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-bold">Tổng hạn mức một người:</span>
              <span className="font-black text-rose-gold tracking-tight">{Math.round(totalPerPerson).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 font-bold">Lượng chi tối đa một ngày:</span>
              <span className="font-extrabold text-[#5eff90] text-sm filter drop-shadow-[0_0_8px_rgba(0,200,83,0.3)]">{Math.round(dailyPerPerson).toLocaleString('vi-VN')} đ / ngày</span>
            </div>
          </div>

          {/* Trigger AI Plan Button with neomorphic press animation */}
          <button
            onClick={handleAskAI}
            disabled={loadingAI}
            id="ai-plan-btn"
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] transition duration-300 active:scale-97 disabled:opacity-50 cursor-pointer"
          >
            {loadingAI ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>Đang điều chế ẩm thực...</span>
              </>
            ) : (
              <>
                <Brain className="w-4.5 h-4.5 text-white" />
                <span>Kích hoạt Tư Vấn Lịch Trình Bằng AI 🚀</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Gemini advice response with Interactive Holographic frog stand on top right */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-3xl border border-white/5 p-6 sm:p-8 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Box Header decor */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-black text-neutral-100 text-xs sm:text-sm uppercase tracking-wider">
                    Pháp sư Cóc AI phân bổ chi tiêu
                  </h3>
                </div>
                <span className="py-1 px-3 bg-white/5 border border-white/10 text-[#5eff90] font-black text-[9px] rounded-full uppercase tracking-widest text-center self-start">
                  Gemini Cybernetic Core
                </span>
              </div>

              {/* Response output */}
              <div className="space-y-4">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    {/* Animated custom interactive loading stage */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/15 border-t-emerald-500 border-b-teal-400 animate-spin" style={{ animationDuration: '4s' }} />
                      <div className="absolute inset-2.5 rounded-full border border-dashed border-[#5eff90]/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                      
                      {/* Magical floating particles */}
                      <motion.div 
                        animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="text-4xl"
                      >
                        🔮
                      </motion.div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-neutral-100 text-sm">Cóc AI đang dọn mâm sinh hoạt...</h4>
                      <p className="text-xs text-neutral-400 max-w-sm">Trợ lý mô phỏng danh sách món sườn cơm tấm bún bò, thời gian biểu chia cháo chống đói rực rỡ.</p>
                    </div>
                  </div>
                ) : aiResponse ? (
                  <div className="prose max-w-none text-neutral-200 animate-fade-in text-xs sm:text-sm leading-relaxed">
                    {renderCustomMarkdown(aiResponse)}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-16 text-center md:text-left">
                    
                    {/* The Interactive stylized holographic Cóc frog and floating particles */}
                    <div className="relative w-36 h-36 bg-emerald-500/5 border border-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_20px_rgba(0,200,83,0.1)]">
                      
                      {/* Floating Particles in orbital circle */}
                      {particles.map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-[#5eff90] rounded-full"
                          initial={{
                            x: 0,
                            y: 0,
                            opacity: 0.2
                          }}
                          animate={{
                            x: [
                              Math.cos(i * 30 * Math.PI / 180) * 55,
                              Math.cos((i * 30 + 120) * Math.PI / 180) * 55,
                              Math.cos((i * 30 + 240) * Math.PI / 180) * 55,
                              Math.cos(i * 30 * Math.PI / 180) * 55
                            ],
                            y: [
                              Math.sin(i * 30 * Math.PI / 180) * 55,
                              Math.sin((i * 30 + 120) * Math.PI / 180) * 55,
                              Math.sin((i * 30 + 240) * Math.PI / 180) * 55,
                              Math.sin(i * 30 * Math.PI / 180) * 55
                            ],
                            opacity: [0.3, 0.9, 0.3],
                            scale: [1, 1.8, 1]
                          }}
                          transition={{
                            duration: 8 + (i % 3) * 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      ))}

                      {/* Hologram concentric rings */}
                      <div className="absolute w-28 h-28 border border-emerald-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />

                      {/* Aesthetic SVG Vector Cóc (Frog) with cyber/metal accents */}
                      <svg viewBox="0 0 100 100" className="w-16 h-16 filter drop-shadow-[0_0_8px_rgba(0,200,83,0.5)]">
                        {/* Shadow pod */}
                        <ellipse cx="50" cy="85" rx="30" ry="8" fill="rgba(0,200,83,0.2)" />
                        {/* Frog feet */}
                        <path d="M 28,75 Q 22,80 20,83 M 72,75 Q 78,80 80,83" stroke="#00C853" strokeWidth="4" strokeLinecap="round" />
                        {/* Arms */}
                        <path d="M 38,60 Q 32,75 35,82 M 62,60 Q 68,75 65,82" stroke="#5eff90" strokeWidth="3" strokeLinecap="round" />
                        {/* Body capsule */}
                        <ellipse cx="50" cy="55" rx="22" ry="24" fill="url(#frogGrad)" stroke="#5eff90" strokeWidth="1.5" />
                        {/* Belly */}
                        <ellipse cx="50" cy="62" rx="14" ry="15" fill="rgba(255, 255, 255, 0.15)" />
                        {/* Eyes */}
                        <circle cx="34" cy="36" r="8" fill="#5eff90" />
                        <circle cx="34" cy="36" r="4" fill="#000" />
                        <circle cx="36" cy="34" r="1.5" fill="#fff" />

                        <circle cx="66" cy="36" r="8" fill="#5eff90" />
                        <circle cx="66" cy="36" r="4" fill="#000" />
                        <circle cx="68" cy="34" r="1.5" fill="#fff" />
                        
                        {/* Happy Mouth */}
                        <path d="M 40,48 Q 50,55 60,48" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        {/* Blush cheeks */}
                        <circle cx="28" cy="48" r="2" fill="#ff5e90" opacity="0.7" />
                        <circle cx="72" cy="48" r="2" fill="#ff5e90" opacity="0.7" />

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="frogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#065f46" />
                          </linearGradient>
                        </defs>
                      </svg>

                    </div>

                    <div className="max-w-xs space-y-2">
                      <h4 className="font-display font-extrabold text-neutral-100 text-sm">Chưa khởi tạo ma trận gợi ý</h4>
                      <p className="text-xs text-neutral-400">Bạn vui lòng điều chỉnh các tham số chi tiêu mong muốn và bấm nút <strong className="text-emerald-400 font-bold">Kích Hoạt Tư Vấn Lịch Trình Bằng AI</strong> để triệu hồi Pháp sư Cóc.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {aiResponse && !loadingAI && (
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                <span>Cóc Food Map VIP 💸</span>
                <span>Ủng hộ dinh dưỡng & tài chính cho sinh viên</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
