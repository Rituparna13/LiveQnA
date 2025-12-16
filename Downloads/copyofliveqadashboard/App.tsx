import React, { useState, useEffect } from 'react';
import { User, Question, Page, UserRole, QuestionStatus } from './types';
import * as API from './services/mockBackend';
import { generateAiAnswer } from './services/geminiService';
import { 
  UserCircle, 
  LogOut, 
  MessageSquarePlus, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  MessageCircle,
  Sparkles,
  Crown,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

// --- SUB-COMPONENTS ---

// 1. LOGIN COMPONENT
const Login = ({ onLogin, onNavigate }: { onLogin: (u: User) => void, onNavigate: (p: Page) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await API.mockLogin(email, password);
    setLoading(false);
    if (res) {
      onLogin(res.user);
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-700/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in border-t border-white/10">
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 group cursor-pointer">
              <Crown className="w-10 h-10 text-gold-gradient drop-shadow-lg group-hover:scale-110 transition-transform" />
           </div>
           <h2 className="text-4xl font-display font-bold text-white mb-2 text-bulge cursor-default">
             Admin <span className="text-gold-gradient">Portal</span>
           </h2>
           <p className="text-purple-200/60 text-sm tracking-wide">Authenticate to moderate the stream.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center animate-pulse">
            <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-bold text-amber-500/80 mb-2 ml-1 group-focus-within:text-amber-400 transition-colors">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full bg-black/40 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-white/20 hover:bg-black/60"
              placeholder="admin@qna.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-bold text-amber-500/80 mb-2 ml-1 group-focus-within:text-amber-400 transition-colors">Password</label>
            <input 
              type="password" 
              required 
              className="w-full bg-black/40 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-white/20 hover:bg-black/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 text-center">
             <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-semibold">Admin Credentials</p>
             <div className="flex justify-center gap-4 text-sm font-mono text-amber-300">
               <span className="bg-black/30 px-2 py-1 rounded">admin@qna.com</span>
               <span className="text-slate-500">|</span>
               <span className="bg-black/30 px-2 py-1 rounded">admin123</span>
             </div>
          </div>
          
          <div className="flex justify-between items-center text-sm px-2">
            <button onClick={() => onNavigate('REGISTER')} className="text-purple-400 hover:text-white transition-colors">
              Create Account
            </button>
            <button onClick={() => onNavigate('DASHBOARD')} className="text-slate-400 hover:text-white transition-colors flex items-center group">
              Enter as Guest <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. REGISTER COMPONENT
const Register = ({ onLogin, onNavigate }: { onLogin: (u: User) => void, onNavigate: (p: Page) => void }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await API.mockRegister(username, email);
    setLoading(false);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-purple-900/20 to-transparent rounded-full blur-3xl opacity-50"></div>
      
      <div className="glass-panel p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-display font-bold text-white mb-2 text-bulge">Join the <span className="text-purple-gradient">Elite</span></h2>
           <p className="text-slate-400 text-sm">Create your digital identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-bold text-purple-400/80 mb-2 ml-1">Username</label>
            <input 
              type="text" 
              required 
              className="w-full bg-black/40 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-white/20"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="group">
            <label className="block text-xs uppercase tracking-widest font-bold text-purple-400/80 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full bg-black/40 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(126,34,206,0.4)] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Initialize Account'}
          </button>
        </form>
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <button onClick={() => onNavigate('LOGIN')} className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. DASHBOARD COMPONENT
const Dashboard = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [guestName, setGuestName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await API.mockGetQuestions();
      setQuestions(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
        return prev;
      });
    };
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    // AJAX XMLHttpRequest Validation logic from services
    const isValid = await API.validateWithXHR(newQuestion);
    if (!isValid) {
      setValidationError('Question cannot be empty.');
      return;
    }
    // Pass guestName if available
    await API.mockPostQuestion(newQuestion, user, guestName);
    setNewQuestion('');
    const updated = await API.mockGetQuestions();
    setQuestions(updated);
  };

  const handlePostAnswer = async (qId: string) => {
    const content = replyContent[qId];
    if (!content || !content.trim()) return;
    await API.mockPostAnswer(qId, content, user);
    setReplyContent(prev => ({ ...prev, [qId]: '' }));
    const updated = await API.mockGetQuestions();
    setQuestions(updated);
  };

  const handleStatusChange = async (qId: string, status: QuestionStatus) => {
    await API.mockUpdateStatus(qId, status);
    const updated = await API.mockGetQuestions();
    setQuestions(updated);
  };

  const handleAskAI = async (qId: string, qContent: string) => {
    setLoadingAI(qId);
    const aiAnswer = await generateAiAnswer(qContent);
    await API.mockPostAnswer(qId, aiAnswer, null, true);
    setLoadingAI(null);
    const updated = await API.mockGetQuestions();
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative selection:bg-purple-500/30 selection:text-white">
      {/* Decorative Top Line */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent z-50 shadow-[0_0_10px_#f59e0b]"></div>
      
      {/* NAVBAR */}
      <nav className="glass-panel sticky top-0 z-40 border-b border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4 group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 transform group-hover:rotate-12 transition-transform duration-300">
                 <MessageCircle className="h-6 w-6 text-white fill-white/20" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-white text-bulge">
                Q&A <span className="text-gold-gradient">Master</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center pl-4 pr-1.5 py-1.5 rounded-full bg-black/40 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex flex-col items-end mr-3">
                     <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">{user.role === UserRole.ADMIN ? 'Admin' : 'Member'}</span>
                     <span className="text-sm font-semibold text-white leading-none">{user.username}</span>
                  </div>
                  <div className={`p-2 rounded-full ${user.role === UserRole.ADMIN ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/20' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'}`}>
                    {user.role === UserRole.ADMIN ? <Crown className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
                  </div>
                </div>
              ) : (
                <span className="text-sm font-bold text-slate-400 bg-black/30 px-4 py-2 rounded-full border border-white/5 uppercase tracking-wider">Guest Access</span>
              )}
              <button onClick={onLogout} className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30" title="Exit">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 sm:px-6 relative z-10">
        
        {/* SUBMIT QUESTION FORM */}
        <div className="glass-panel rounded-3xl p-[1px] mb-12 shadow-2xl shadow-purple-900/10 bg-gradient-to-br from-white/10 to-transparent">
            <div className="bg-slate-900/90 rounded-[23px] p-8 border border-white/5 backdrop-blur-xl">
              <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center text-bulge">
                <Zap className="h-6 w-6 mr-3 text-amber-400 fill-amber-400/20" />
                Submit a Query
              </h3>
              <form onSubmit={handlePostQuestion} className="space-y-4 relative group">
                {!user && (
                    <div className="relative">
                        <label className="text-xs uppercase font-bold text-purple-400 ml-2 mb-1 block tracking-wider">Name (Optional)</label>
                        <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your Name (e.g. Alex)"
                        className="w-full bg-black/50 border border-white/10 text-white rounded-2xl px-6 py-3 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent shadow-inner transition-all placeholder-white/20 text-md hover:bg-black/70"
                        />
                    </div>
                )}
                <div className="relative">
                     <label className="text-xs uppercase font-bold text-amber-500 ml-2 mb-1 block tracking-wider">Question</label>
                    <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What is on your mind?"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-2xl pl-6 pr-16 py-5 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent shadow-inner transition-all placeholder-white/20 text-lg hover:bg-black/70"
                    />
                    <button 
                    type="submit"
                    className="absolute right-3 top-8 bottom-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black px-6 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center transform hover:-translate-x-1"
                    >
                    <Send className="h-5 w-5" />
                    </button>
                </div>
              </form>
              {validationError && <p className="text-red-400 text-sm mt-4 flex items-center font-bold animate-pulse bg-red-400/10 p-2 rounded-lg inline-flex"><AlertCircle className="h-4 w-4 mr-2"/> {validationError}</p>}
            </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-3xl font-display font-bold text-white text-bulge">Live Feed <span className="text-white/20 text-2xl font-normal ml-2">({questions.length})</span></h2>
            <span className="flex items-center text-[10px] font-black tracking-widest uppercase text-green-400 bg-green-900/10 px-4 py-2 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping"></span>
              Socket Active
            </span>
          </div>

          {questions.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500 text-lg">The channel is quiet. Be the first to initiate.</p>
            </div>
          )}

          {questions.map((q) => (
            <div key={q.id} className={`group relative rounded-3xl transition-all duration-500 animate-fade-in
                ${q.status === QuestionStatus.ESCALATED 
                    ? 'glass-panel-gold transform scale-[1.01] shadow-[0_0_30px_rgba(245,158,11,0.15)] z-20' 
                    : 'glass-panel bg-slate-900/40 hover:bg-slate-900/60 border-l-4 border-l-purple-500/50'}`}>
              
              {/* Question Header */}
              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`font-bold text-sm tracking-widest uppercase ${q.status === QuestionStatus.ESCALATED ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-purple-400'}`}>
                          {q.username}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{new Date(q.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      
                      {q.status === QuestionStatus.ESCALATED && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse">
                          <TrendingUp className="w-3 h-3 mr-1" /> Escalated
                        </span>
                      )}
                      {q.status === QuestionStatus.ANSWERED && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolved
                        </span>
                      )}
                      {q.status === QuestionStatus.PENDING && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-[0_0_10px_rgba(148,163,184,0.1)]">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </div>
                    <p className={`text-xl md:text-2xl font-medium leading-relaxed ${q.status === QuestionStatus.ESCALATED ? 'text-white font-display' : 'text-slate-200'}`}>
                        {q.content}
                    </p>
                  </div>

                  {/* Admin Actions */}
                  {user?.role === UserRole.ADMIN && (
                    <div className="flex flex-col gap-3 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {q.status !== QuestionStatus.ANSWERED && (
                         <button 
                         onClick={() => handleStatusChange(q.id, QuestionStatus.ANSWERED)}
                         className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all border border-green-500/20 shadow hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                         title="Mark Answered"
                       >
                         <CheckCircle className="w-5 h-5" />
                       </button>
                      )}
                      {q.status !== QuestionStatus.ESCALATED && (
                        <button 
                          onClick={() => handleStatusChange(q.id, QuestionStatus.ESCALATED)}
                          className="p-3 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-black transition-all border border-amber-500/20 shadow hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          title="Escalate Priority"
                        >
                          <TrendingUp className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Answers Section */}
              <div className="bg-black/30 p-8 rounded-b-3xl border-t border-white/5 backdrop-blur-md">
                <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                  {q.answers.map((a) => (
                    <div key={a.id} className="flex flex-col items-start animate-fade-in">
                      <div className={`rounded-2xl p-5 text-sm max-w-[95%] shadow-lg relative overflow-hidden group/answer
                          ${a.isAiGenerated 
                             ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 text-indigo-100' 
                             : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 transition-colors'}`}>
                         
                         {a.isAiGenerated && (
                            <>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-3xl rounded-full"></div>
                                <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full"></div>
                            </>
                         )}

                         <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5 relative z-10">
                            <span className={`font-bold text-xs uppercase tracking-widest flex items-center ${a.isAiGenerated ? 'text-indigo-300' : 'text-slate-400'}`}>
                                {a.isAiGenerated ? (
                                    <><Sparkles className="w-4 h-4 mr-2 text-indigo-400 animate-pulse" /> AI Assistant</>
                                ) : (
                                    <>{a.userId === 'u1' && <Shield className="w-4 h-4 mr-2 text-amber-500 drop-shadow-md" />} {a.username}</>
                                )}
                            </span>
                            <span className="text-[10px] text-white/20 font-mono">{new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                         </div>
                         <p className="leading-7 relative z-10 text-[15px]">{a.content}</p>
                      </div>
                    </div>
                  ))}
                  {q.answers.length === 0 && <p className="text-sm text-slate-600 italic pl-2">No responses yet. Start the conversation.</p>}
                </div>

                {/* Reply Input */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 group/input">
                    <input 
                        type="text" 
                        placeholder="Contribute your knowledge..." 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-600 transition-all hover:bg-black/60"
                        value={replyContent[q.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePostAnswer(q.id);
                        }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-purple-500/5 pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <button 
                    onClick={() => handlePostAnswer(q.id)}
                    className="p-3.5 bg-white/5 text-purple-400 rounded-xl hover:bg-purple-600 hover:text-white transition-all border border-white/10 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    title="Send Reply"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  
                  {/* AI Feature Button */}
                  <button 
                    onClick={() => handleAskAI(q.id, q.content)}
                    disabled={loadingAI === q.id}
                    className={`flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold transition-all border
                        ${loadingAI === q.id 
                            ? 'bg-indigo-900/20 text-indigo-300 border-indigo-500/30 cursor-wait' 
                            : 'bg-indigo-950/30 text-indigo-400 border-indigo-500/20 hover:bg-indigo-900/60 hover:text-white hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'}`}
                    title="Generate AI Response"
                  >
                    {loadingAI === q.id ? (
                        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span className="hidden sm:inline">AI Auto-Reply</span>
                        </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP WRAPPER ---
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('LOGIN');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('LOGIN');
  };

  const handleNavigate = (p: Page) => {
    if (p === 'DASHBOARD' && !user) {
        setUser(null);
    }
    setCurrentPage(p);
  };

  return (
    <>
      {currentPage === 'LOGIN' && <Login onLogin={handleLogin} onNavigate={handleNavigate} />}
      {currentPage === 'REGISTER' && <Register onLogin={handleLogin} onNavigate={handleNavigate} />}
      {currentPage === 'DASHBOARD' && <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}
