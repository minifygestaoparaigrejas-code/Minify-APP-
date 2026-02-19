import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, ShieldCheck, GraduationCap,
  LayoutDashboard, Users, Calendar, Settings,
  LogOut, MessageSquare, FileText, Heart, MessageCircle, Share2,
  Image as ImageIcon, Send, Search, MoreHorizontal, Bell,
  DollarSign, TrendingUp, TrendingDown, Plus, X, Filter, Wallet, Menu, ArrowRight, CheckCircle, Building2, MapPin, ArrowLeft, Lock, Lightbulb, Edit3, Mail, Sparkles, Activity, Clock, MoreVertical, ChevronLeft, ChevronRight, CalendarDays, Briefcase, Paperclip,
  CalendarCheck, Mic2, Music, UserCheck, Layers, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { UserRole, User as UserType, Post, Transaction, TransactionType, Church, ChurchEvent, EventType, NavItem, Group, ChatMessage } from './types';
import AIChat from './components/AIChat';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

// --- MOCK DATA ---

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author: { name: 'Jonathan Wallyce', role: UserRole.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Jonathan+Wallyce&background=6366f1&color=fff' },
    content: 'A paz do Senhor, amados! Lembrando que nosso culto de oração começa hoje às 19h30. Não percam!',
    likes: 24,
    comments: 5,
    timestamp: 'Há 2 horas',
    type: 'announcement',
    churchId: 'hq'
  },
  {
    id: 'p2',
    author: { name: 'Prof. Carlos', role: UserRole.TEACHER, avatar: 'https://ui-avatars.com/api/?name=Carlos+Eduardo&background=0ea5e9&color=fff' },
    content: 'Disponibilizei o material da aula de Teologia Sistemática na aba de Ensino. Baixem o PDF para domingo.',
    likes: 15,
    comments: 2,
    timestamp: 'Há 5 horas',
    type: 'devotional',
    churchId: 'hq'
  }
];

const INITIAL_EVENTS: ChurchEvent[] = [
  {
    id: 'evt-1',
    title: 'Culto da Família',
    date: new Date().toISOString(),
    type: EventType.SERVICE,
    churchId: 'hq',
    details: { location: 'Templo Maior', leader: 'Pr. Jonathan', subtitle: 'Uma noite de milagres' }
  },
  {
    id: 'evt-2',
    title: 'Aula: Panorama Bíblico',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    type: EventType.CLASS,
    churchId: 'hq',
    details: { location: 'Sala 3', leader: 'Prof. Carlos', lessonNumber: '4', subtitle: 'Módulo: Antigo Testamento' }
  },
  {
    id: 'evt-3',
    title: 'Reunião de Obreiros',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    type: EventType.MEETING,
    churchId: 'hq',
    details: { location: 'Sala de Reuniões', leader: 'Pr. Jonathan' }
  }
];

// --- DESIGN SYSTEM COMPONENTS ---

const Card: React.FC<{ children?: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className, noPadding = false }) => (
  <div className={`bg-white rounded-2xl border border-surface-200 shadow-soft transition-all duration-300 hover:shadow-lg ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children?: React.ReactNode; variant?: 'brand' | 'success' | 'warning' | 'neutral' | 'error' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    neutral: 'bg-surface-100 text-surface-600 border-surface-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: any }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';

  return (
    <div className="relative group">
      {props.icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors">{props.icon}</div>}
      <input
        {...props}
        type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
        className={`w-full bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white p-3 transition-all outline-none placeholder:text-surface-400 ${props.icon ? 'pl-10' : ''} ${isPassword ? 'pr-12' : ''} ${props.className}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-brand-500 transition-colors p-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }: any) => {
  const baseStyle = "font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-base rounded-2xl"
  };

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/25 border border-transparent", // Azul Brand
    secondary: "bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 hover:border-surface-300 shadow-sm",
    outline: "border border-brand-200 text-brand-600 hover:bg-brand-50",
    ghost: "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
  };

  return <button {...props} className={`${baseStyle} ${sizes[size as keyof typeof sizes]} ${variants[variant as keyof typeof variants]} ${className}`}>{children}</button>;
};

// --- MINIFY LOGO COMPONENT ---
const MinifyLogo = ({ className = "w-8 h-8", light = false }: { className?: string, light?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke={light ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    {/* Stylized drop/pen element in center */}
    <path d="M12 7v6" strokeWidth="2.5" />
    <circle cx="12" cy="15" r="1" fill={light ? "white" : "currentColor"} stroke="none" />
  </svg>
);

// --- AUTH SCREENS ---

// --- ONBOARDING WIZARD ---

const OnboardingWizard = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    churchName: '',
    churchType: 'HQ',
    address: '',
    departments: [] as string[],
    plan: 'basic'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const DEPARTMENTS = [
    { id: 'finance', name: 'Financeiro', icon: DollarSign, desc: 'Gestão completa de dízimos e ofertas' },
    { id: 'teaching', name: 'Ensino / EBD', icon: BookOpen, desc: 'Aulas, presença e material didático' },
    { id: 'events', name: 'Eventos & Cultos', icon: Calendar, desc: 'Escalabilidade e liturgia' },
    { id: 'social', name: 'Comunicação', icon: MessageSquare, desc: 'Rede social interna e avisos' },
    { id: 'membership', name: 'Membros', icon: Users, desc: 'Cadastro e acompanhamento pastoral' },
  ];

  const PLANS = [
    { id: 'free', name: 'Gratuito', price: 'R$ 0', period: '/mês', desc: 'Para igrejas pequenas em início.' },
    { id: 'pro', name: 'Profissional', price: 'R$ 89', period: '/mês', desc: 'Recursos avançados e suporte prioritário.' },
    { id: 'premium', name: 'Premium / Sede', price: 'R$ 199', period: '/mês', desc: 'Ideal para sedes com múltiplas filiais.' },
  ];

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-surface-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/5 to-surface-50"></div>

      <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-brand-100 overflow-hidden min-h-[500px] flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-surface-100">
          <motion.div
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            className="h-full bg-brand-600"
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...stepVariants} className="flex-1 flex flex-col p-4">
              <div className="mb-8">
                <Badge variant="brand">Passo 1 de 4</Badge>
                <h2 className="text-3xl font-bold text-surface-900 mt-2">Sua Igreja</h2>
                <p className="text-surface-500">Comece informando os dados básicos da sua congregação.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-surface-700 mb-1.5 block">Nome da Igreja</label>
                  <Input
                    placeholder="Ex: Minify Zona Norte"
                    value={data.churchName}
                    onChange={(e: any) => setData({ ...data, churchName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setData({ ...data, churchType: 'HQ' })}
                    className={`p-4 rounded-xl border transition-all text-left ${data.churchType === 'HQ' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-200'}`}
                  >
                    <Building2 className={data.churchType === 'HQ' ? 'text-brand-600' : 'text-surface-400'} size={24} />
                    <div className="font-bold mt-2">Sede</div>
                    <div className="text-xs text-surface-500">Igreja principal ou única.</div>
                  </button>
                  <button
                    onClick={() => setData({ ...data, churchType: 'BRANCH' })}
                    className={`p-4 rounded-xl border transition-all text-left ${data.churchType === 'BRANCH' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-200'}`}
                  >
                    <MapPin className={data.churchType === 'BRANCH' ? 'text-brand-600' : 'text-surface-400'} size={24} />
                    <div className="font-bold mt-2">Filial</div>
                    <div className="text-xs text-surface-500">Parte de um ministério maior.</div>
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-8 flex justify-end">
                <Button onClick={nextStep} disabled={!data.churchName} size="lg">Continuar <ArrowRight size={18} /></Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...stepVariants} className="flex-1 flex flex-col p-4">
              <div className="mb-8">
                <Badge variant="brand">Passo 2 de 4</Badge>
                <h2 className="text-3xl font-bold text-surface-900 mt-2">O que sua igreja precisa?</h2>
                <p className="text-surface-500">Selecione os módulos que deseja ativar inicialmente.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEPARTMENTS.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      const exists = data.departments.includes(dept.id);
                      setData({
                        ...data,
                        departments: exists
                          ? data.departments.filter(d => d !== dept.id)
                          : [...data.departments, dept.id]
                      });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${data.departments.includes(dept.id) ? 'border-brand-500 bg-brand-50' : 'border-surface-100 hover:border-brand-100 bg-surface-50/50'}`}
                  >
                    <div className={`p-2 rounded-lg ${data.departments.includes(dept.id) ? 'bg-brand-600 text-white' : 'bg-white text-surface-400 border'}`}>
                      <dept.icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-surface-900">{dept.name}</div>
                      <div className="text-[10px] text-surface-500 uppercase font-bold tracking-wider">Módulo</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                <Button onClick={nextStep} size="lg">Avançar <ArrowRight size={18} /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...stepVariants} className="flex-1 flex flex-col p-4">
              <div className="mb-8">
                <Badge variant="brand">Passo 3 de 4</Badge>
                <h2 className="text-3xl font-bold text-surface-900 mt-2">Escolha seu Plano</h2>
                <p className="text-surface-500">Selecione a opção que melhor se adapta à sua realidade.</p>
              </div>

              <div className="space-y-3">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setData({ ...data, plan: plan.id })}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${data.plan === plan.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-surface-200 hover:border-brand-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.plan === plan.id ? 'border-brand-600' : 'border-surface-300'}`}>
                        {data.plan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-surface-900">{plan.name}</div>
                        <div className="text-xs text-surface-500">{plan.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-600">{plan.price}</div>
                      <div className="text-[10px] text-surface-400 uppercase font-bold tracking-widest">{plan.period}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Voltar</Button>
                <Button onClick={nextStep} size="lg">Ver Proposta <ArrowRight size={18} /></Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" {...stepVariants} className="flex-1 flex flex-col p-4 items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-surface-900">Tudo Pronto para Escalar!</h2>
              <p className="text-surface-600 mt-4 max-w-sm">
                Ao investir no Minify, você economiza até **10 horas semanais** com burocracia, foca no ministério e garante transparência total no financeiro.
              </p>

              <div className="mt-8 p-6 bg-brand-900 text-white rounded-2xl w-full text-left">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Sua Configuração</div>
                <div className="text-xl font-bold mb-1">{data.churchName}</div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="neutral" className="bg-white/10 border-white/20 text-white uppercase text-[8px]">{data.churchType === 'HQ' ? 'Sede' : 'Filial'}</Badge>
                  <span className="text-brand-300 text-xs">• {data.departments.length} módulos ativos</span>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <div className="text-xs text-brand-300">Plano Escolhido</div>
                    <div className="font-bold text-lg">{PLANS.find(p => p.id === data.plan)?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{PLANS.find(p => p.id === data.plan)?.price}</div>
                    <div className="text-[8px] font-bold opacity-60">POR MÊS</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 w-full flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={prevStep}>Ajustar</Button>
                <Button className="flex-[2]" size="lg" onClick={() => onComplete(data)}>Começar Minha Jornada</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};
// --- FINANCE DASHBOARD ---

const FinanceDashboard = () => {
  const transactions: Transaction[] = [
    { id: 't1', type: 'income', amount: 2500, description: 'Dízimos Culto Domingo', category: 'Dízimos', date: new Date().toISOString(), churchId: 'hq' },
    { id: 't2', type: 'expense', amount: 800, description: 'Conta de Energia', category: 'Operacional', date: new Date().toISOString(), churchId: 'hq' },
    { id: 't3', type: 'income', amount: 450, description: 'Oferta Especial Missões', category: 'Ofertas', date: new Date().toISOString(), churchId: 'hq' },
    { id: 't4', type: 'expense', amount: 1200, description: 'Aluguel Salão Filial', category: 'Aluguel', date: new Date().toISOString(), churchId: 'hq' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-brand-600 border-none text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
            <h3 className="text-3xl font-black">R$ 15.420,50</h3>
            <div className="flex items-center gap-2 mt-4 text-brand-200 text-sm">
              <TrendingUp size={16} />
              <span>+12% em relação ao mês anterior</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <Wallet className="absolute right-6 top-6 opacity-10" size={48} />
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/30">
          <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">Entradas (Mês)</p>
          <h3 className="text-2xl font-bold text-surface-900">R$ 8.240,00</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[75%]"></div>
            </div>
            <span className="text-xs font-bold text-emerald-600">75%</span>
          </div>
        </Card>

        <Card className="border-rose-100 bg-rose-50/30">
          <p className="text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-1">Saídas (Mês)</p>
          <h3 className="text-2xl font-bold text-surface-900">R$ 3.120,00</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[35%]"></div>
            </div>
            <span className="text-xs font-bold text-rose-600">35%</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl text-surface-900">Transações Recentes</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary"><Filter size={16} /> Filtrar</Button>
              <Button size="sm"><Plus size={16} /> Nova</Button>
            </div>
          </div>

          <Card noPadding className="overflow-hidden border-surface-200">
            <div className="bg-surface-50 px-6 py-3 border-b border-surface-200 grid grid-cols-4 text-[10px] font-black uppercase text-surface-400 tracking-widest">
              <div className="col-span-2">Descrição</div>
              <div>Categoria</div>
              <div className="text-right">Valor</div>
            </div>
            <div className="divide-y divide-surface-100">
              {transactions.map(t => (
                <div key={t.id} className="px-6 py-4 grid grid-cols-4 items-center hover:bg-surface-50/50 transition-colors group">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{t.description}</div>
                      <div className="text-[10px] text-surface-500">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-surface-600">{t.category}</div>
                  <div className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-bold text-xl text-surface-900">Insights Financeiros</h3>
          <Card className="bg-surface-900 border-none text-white p-6 shadow-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="text-brand-400" />
            </div>
            <h4 className="font-bold text-lg mb-2">Meta de Missões</h4>
            <p className="text-surface-400 text-sm mb-6">Estamos a apenas **R$ 1.500** de atingir nossa meta para o projeto missionário.</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-brand-300">Progresso</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full w-[85%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-surface-100 flex items-center gap-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><Activity size={18} /></div>
              <span className="font-bold text-sm">Distribuição de Gastos</span>
            </div>
            <div className="p-4 space-y-4">
              {[
                { label: 'Operacional', val: 45, color: 'bg-indigo-500' },
                { label: 'Manutenção', val: 25, color: 'bg-emerald-500' },
                { label: 'Social', val: 30, color: 'bg-amber-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full bg-surface-100 h-1 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- GAMIFIED TUTORIAL ---

const GamifiedTutorial = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Seja bem-vindo, Pastor!",
      content: "O Minify é o seu novo braço direito na gestão do Reino. Sua conta já está ativa e seu dashboard pronto!",
      icon: <Sparkles size={40} className="text-amber-400" />,
      highlight: "header"
    },
    {
      title: "Financeiro em Tempo Real",
      content: "Aqui você tem transparência total. Dízimos, ofertas e gastos da sede e filiais em um só lugar.",
      icon: <DollarSign size={40} className="text-emerald-400" />,
      highlight: "sidebar-finance"
    },
    {
      title: "Comunicação que Transforma",
      content: "Use o Feed para manter a igreja unida e bem informada sobre cada culto e evento.",
      icon: <MessageSquare size={40} className="text-brand-400" />,
      highlight: "feed"
    },
    {
      title: "Experiência Completa",
      content: "Nossa IA e as ferramentas de gestão foram pensadas para você focar no que importa: as pessoas.",
      icon: <LayoutDashboard size={40} className="text-indigo-400" />,
      highlight: "ai-fab"
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-surface-900/40 backdrop-blur-[2px] flex items-end lg:items-center justify-center p-6 pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 pointer-events-auto mb-10 lg:mb-0"
        >
          {/* Animated Background Element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px]"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="w-20 h-20 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-surface-100">
                {steps[step].icon}
              </div>
              <h2 className="text-2xl font-black text-surface-900 leading-tight mb-3">{steps[step].title}</h2>
              <p className="text-surface-600 text-base leading-relaxed mb-8 px-4 font-medium">{steps[step].content}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-4 relative z-10">
            <Button size="lg" className="w-full text-lg h-14 shadow-lg shadow-brand-500/30" onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onFinish()}>
              {step < steps.length - 1 ? "Entendi, Próximo 🚀" : "Concluir Apresentação 🎉"}
            </Button>
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-brand-600' : 'w-2 bg-surface-200'}`} />
              ))}
            </div>
          </div>

          {step === 0 && <div className="absolute -bottom-2 right-2 text-[10px] text-surface-300 font-bold uppercase tracking-widest opacity-50">Tour Minify v1.0</div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthScreen = ({ onLogin }: any) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        onLogin({
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || '',
          role: UserRole.ADMIN,
          avatar: `https://ui-avatars.com/api/?name=${data.user.email}&background=6366f1&color=fff`,
          churchId: 'hq'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            role: 'admin'
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        if (!data.session) {
          setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.');
        } else {
          onLogin({
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'Novo Usuário',
            email: data.user.email || '',
            role: UserRole.ADMIN,
            avatar: `https://ui-avatars.com/api/?name=${data.user.email}&background=6366f1&color=fff`,
            churchId: 'hq'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 font-sans">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#312e81] to-[#1e1b4b]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[128px] opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-32 h-32 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/20 shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)]">
            <MinifyLogo className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" light />
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">Minify</h1>
          <div className="h-1 w-16 bg-brand-400/80 rounded-full mb-6"></div>
          <p className="text-white/80 text-sm tracking-[0.25em] font-medium uppercase drop-shadow-md">Gestão para Igrejas</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-surface-900 tracking-tight">
              {mode === 'login' && 'Bem-vindo'}
              {mode === 'register' && 'Crie sua conta'}
              {mode === 'forgot' && 'Recuperar senha'}
            </h2>
            <p className="text-surface-500 mt-2">
              {mode === 'login' && 'Acesse o sistema Minify.'}
              {mode === 'register' && 'Junte-se ao Minify hoje.'}
              {mode === 'forgot' && 'Enviaremos um link de recuperação.'}
            </p>
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-medium border border-rose-100">{error}</div>}
          {success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-100">{success}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="seu@email.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-surface-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  Lembrar-me
                </label>
                <button type="button" onClick={() => setMode('forgot')} className="text-brand-600 font-medium hover:underline">Esqueceu a senha?</button>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
              </Button>
              <p className="text-center text-sm text-surface-500">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-brand-600 font-bold hover:underline">Cadastre-se</button>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                placeholder="seu@email.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Sua senha"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirme sua senha"
                icon={<ShieldCheck size={18} />}
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Registrar'}
              </Button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para o Login
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                placeholder="seu@email.com"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
              >
                <ArrowLeft size={16} /> Voltar para o Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODALS (Enhanced UI) ---

const ModalShell = ({ title, icon: Icon, onClose, children }: any) => (
  <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-white/50 overflow-hidden">
      <div className="px-6 py-5 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
        <h3 className="font-bold text-lg text-surface-900 flex items-center gap-3">
          <div className="bg-brand-100 p-2 rounded-xl text-brand-600"><Icon size={20} /></div>
          {title}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-full transition-colors text-surface-500"><X size={20} /></button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const CreateServiceModal = ({ onClose, onSave }: any) => {
  const [formData, setFormData] = useState({ title: '', date: '', leader: '', subtitle: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      type: EventType.SERVICE,
      churchId: 'hq',
      details: { leader: formData.leader, subtitle: formData.subtitle, description: formData.description, location: 'Templo Principal' }
    });
  };

  return (
    <ModalShell title="Registrar Culto" icon={Building2} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Data</label><Input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required /></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Título</label><Input placeholder="Ex: Culto de Santa Ceia" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
        </div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Subtítulo</label><Input placeholder="Ex: Uma noite de renovo" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Pregador</label><Input icon={<Mic2 size={16} />} placeholder="Nome do Pastor" value={formData.leader} onChange={e => setFormData({ ...formData, leader: e.target.value })} required /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Descrição</label><textarea className="w-full bg-surface-50 border border-surface-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" rows={3} placeholder="Detalhes litúrgicos..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
        <Button type="submit" className="w-full" size="lg">Confirmar Agendamento</Button>
      </form>
    </ModalShell>
  );
};

// --- FEATURES & VIEWS ---

const CalendarView = ({ events, onAddEvent }: { events: ChurchEvent[], onAddEvent: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-fade-in-up">
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-surface-800 capitalize flex items-center gap-3">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><CalendarCheck size={24} /></div>
              {monthName}
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft size={16} /></Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight size={16} /></Button>
              <Button onClick={onAddEvent} size="sm" className="ml-2"><Plus size={16} /> Novo</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 mb-4 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="text-xs font-bold text-surface-400 uppercase tracking-wide">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 flex-1 gap-px bg-surface-100 rounded-2xl overflow-hidden border border-surface-100">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-white" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = events.filter(e => {
                    const d = new Date(e.date);
                    return d.getDate() === day && d.getMonth() === currentDate.getMonth();
                  });
                  return (
                    <div key={day} className="bg-white min-h-[100px] p-2 hover:bg-surface-50 transition-colors cursor-pointer group relative">
                      <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() ? 'bg-brand-600 text-white shadow-md' : 'text-surface-600'}`}>{day}</span>
                      <div className="flex flex-col gap-1">
                        {dayEvents.slice(0, 3).map((ev, idx) => (
                          <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${ev.type === EventType.SERVICE ? 'bg-brand-50 text-brand-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <h3 className="font-bold text-surface-900 mb-4">Próximos 7 Dias</h3>
          <div className="space-y-4">
            {events.slice(0, 4).map(evt => (
              <div key={evt.id} className="flex gap-3 group">
                <div className="flex flex-col items-center justify-center bg-surface-50 w-12 h-12 rounded-xl border border-surface-200 group-hover:border-brand-200 group-hover:bg-brand-50 transition-colors">
                  <span className="text-xs font-bold text-surface-400 group-hover:text-brand-500">{new Date(evt.date).getDate()}</span>
                  <span className="text-[10px] font-bold uppercase text-surface-300 group-hover:text-brand-400">{new Date(evt.date).toLocaleString('pt-BR', { month: 'short' }).slice(0, 3)}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-surface-800 line-clamp-1">{evt.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {evt.details.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="p-4 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <Sparkles className="absolute top-2 right-2 text-white/20" size={40} />
          <h3 className="font-bold text-lg mb-2 relative z-10">Dica Pastoral</h3>
          <p className="text-sm text-brand-100 relative z-10">Mantenha a agenda da igreja atualizada para que os membros não percam nenhum evento importante.</p>
        </div>
      </div>
    </div>
  );
};

const ServicesManager = ({ events, onAddService }: any) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Liturgia & Cultos</h1>
          <p className="text-surface-500 mt-1">Gerencie a programação espiritual da igreja.</p>
        </div>
        <Button onClick={onAddService} className="shadow-brand-500/25"><Plus size={18} /> Novo Culto</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.filter((e: any) => e.type === EventType.SERVICE).map((service: any) => (
          <Card key={service.id} className="group hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full border-l-4 border-l-transparent hover:border-l-brand-500">
            <div className="flex justify-between items-start mb-4">
              <Badge variant={new Date(service.date) > new Date() ? 'brand' : 'neutral'}>
                {new Date(service.date) > new Date() ? 'Agendado' : 'Realizado'}
              </Badge>
              <button className="text-surface-400 hover:text-surface-600"><MoreHorizontal size={20} /></button>
            </div>

            <div className="mb-4">
              <div className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">
                {new Date(service.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <h3 className="text-xl font-bold text-surface-900 leading-tight group-hover:text-brand-600 transition-colors">{service.title}</h3>
              <p className="text-sm text-surface-500 mt-2 line-clamp-2">{service.details.subtitle}</p>
            </div>

            <div className="mt-auto pt-4 border-t border-surface-100 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Mic2 size={16} className="text-brand-400" />
                <span className="font-medium">{service.details.leader}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Clock size={16} className="text-surface-400" />
                <span>{new Date(service.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT & APP ---

export default function App() {
  const [view, setView] = useState<'login' | 'onboarding' | 'app'>('login');
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [events, setEvents] = useState<ChurchEvent[]>(INITIAL_EVENTS);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          role: UserRole.ADMIN,
          avatar: `https://ui-avatars.com/api/?name=${session.user.email}&background=6366f1&color=fff`,
          churchId: 'hq'
        });

        // Verificar se precisa de onboarding (por agora, apenas checamos localmente)
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_${session.user.id}`);
        const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${session.user.id}`);
        setView(hasCompletedOnboarding ? 'app' : 'onboarding');
        setShowTutorial(!hasSeenTutorial);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          role: UserRole.ADMIN,
          avatar: `https://ui-avatars.com/api/?name=${session.user.email}&background=6366f1&color=fff`,
          churchId: 'hq'
        });
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_${session.user.id}`);
        setView(hasCompletedOnboarding ? 'app' : 'onboarding');
      } else {
        setUser(null);
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (u: UserType) => {
    setUser(u);
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_${u.id}`);
    const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${u.id}`);
    setView(hasCompletedOnboarding ? 'app' : 'onboarding');
    setShowTutorial(!hasSeenTutorial);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding Finalizado:', data);
    if (user?.id) {
      localStorage.setItem(`onboarding_${user.id}`, 'true');
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
      setShowTutorial(!hasSeenTutorial);
    }
    setView('app');
  };

  if (view === 'login') return <AuthScreen onLogin={handleLogin} />;
  if (view === 'onboarding') return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  if (!user) return null;

  const SidebarItem = ({ item, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${active ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full"></div>}
      <item.icon size={20} className={active ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'} />
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex font-sans text-surface-900">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* SIDEBAR NAVIGATION DOCK */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-surface-200 flex flex-col shadow-soft transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <MinifyLogo className="w-6 h-6" light />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-surface-900">Minify</h1>
            <p className="text-xs text-brand-600 font-semibold tracking-wider uppercase">Gestão para Igrejas</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-4 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">Principal</div>
          {[
            { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
            { id: 'calendar', label: 'Calendário', icon: CalendarDays },
            { id: 'services', label: 'Cultos & Liturgia', icon: Building2 },
            { id: 'teaching', label: 'Ensino / EBD', icon: GraduationCap },
          ].map(item => <SidebarItem key={item.id} item={item} active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} />)}

          <div className="px-4 mt-8 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">Gestão</div>
          {[
            { id: 'members', label: 'Membros', icon: Users },
            { id: 'finance', label: 'Financeiro', icon: DollarSign },
            { id: 'profile', label: 'Meu Perfil', icon: User },
          ].map(item => <SidebarItem key={item.id} item={item} active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} />)}
        </nav>

        <div className="p-4 border-t border-surface-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 border border-surface-100 mb-2">
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate text-surface-900">{user.name}</p>
              <p className="text-xs text-surface-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-4 border-b border-surface-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-surface-600 hover:bg-surface-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-surface-800 capitalize truncate">{activeTab === 'dashboard' ? `Olá, ${user.name.split(' ')[0]}` : activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl hover:bg-surface-100 text-surface-500 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <Button variant="primary" size="sm" onClick={() => setShowServiceModal(true)}>
              <Plus size={16} /> <span className="hidden sm:inline">Ação Rápida</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">

            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                {/* Main Feed */}
                <div className="col-span-1 lg:col-span-8 space-y-8">
                  <Card noPadding className="overflow-hidden border-surface-200">
                    <div className="p-6 bg-gradient-to-r from-brand-600 to-indigo-700 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Compartilhar com a Igreja</h3>
                        <p className="text-brand-100 text-sm">Publique avisos, devocionais ou atualizações.</p>
                      </div>
                      <Sparkles className="text-brand-400 opacity-50" />
                    </div>
                    <div className="p-6">
                      <textarea className="w-full border-none resize-none focus:ring-0 text-surface-700 placeholder:text-surface-400 text-lg bg-transparent outline-none min-h-[100px]" placeholder="O que você gostaria de compartilhar hoje?" />
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-100">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-surface-100 rounded-lg text-surface-500 transition-colors"><ImageIcon size={20} /></button>
                          <button className="p-2 hover:bg-surface-100 rounded-lg text-surface-500 transition-colors"><Paperclip size={20} /></button>
                          <button className="p-2 hover:bg-surface-100 rounded-lg text-surface-500 transition-colors"><MessageCircle size={20} /></button>
                        </div>
                        <Button size="md" className="px-8 shadow-brand-500/25">Publicar</Button>
                      </div>
                    </div>
                  </Card>

                  {posts.map(post => (
                    <Card key={post.id}>
                      <div className="flex items-center gap-4 mb-4">
                        <img src={post.author.avatar} className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm" />
                        <div>
                          <h4 className="font-bold text-surface-900">{post.author.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-surface-500">
                            <span className="px-1.5 py-0.5 rounded bg-surface-100 font-medium text-surface-600">{post.author.role}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                        <button className="ml-auto text-surface-400 hover:text-surface-600"><MoreHorizontal /></button>
                      </div>
                      <div className="pl-16">
                        <p className="text-surface-700 leading-relaxed text-base">{post.content}</p>
                        <div className="flex gap-6 mt-6 pt-4 border-t border-surface-100 flex-wrap">
                          <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors"><Heart size={18} /> {post.likes}</button>
                          <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors"><MessageSquare size={18} /> {post.comments}</button>
                          <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors ml-auto"><Share2 size={18} /> Compartilhar</button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Sidebar Widgets */}
                <div className="col-span-1 lg:col-span-4 space-y-8">
                  <Card>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-surface-900">Agenda da Semana</h3>
                      <button className="text-brand-600 text-sm font-medium hover:underline">Ver tudo</button>
                    </div>
                    <div className="space-y-4">
                      {events.slice(0, 3).map((evt, i) => (
                        <div key={i} className="flex gap-4 items-start pb-4 border-b border-surface-50 last:border-0 last:pb-0">
                          <div className="w-14 h-14 rounded-2xl bg-surface-50 border border-surface-100 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-surface-900">{new Date(evt.date).getDate()}</span>
                            <span className="text-[10px] font-bold text-surface-400 uppercase">{new Date(evt.date).toLocaleString('pt-BR', { month: 'short' }).slice(0, 3)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-surface-900 line-clamp-1">{evt.title}</h4>
                            <p className="text-xs text-surface-500 mt-1 flex items-center gap-1"><Clock size={12} /> {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <Badge variant={evt.type === EventType.SERVICE ? 'brand' : 'neutral'}><span className="text-[10px]">{evt.type}</span></Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="bg-gradient-to-br from-indigo-900 to-brand-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4"><Lightbulb className="text-yellow-300" /></div>
                      <h3 className="font-bold text-lg mb-2">Devocional do Dia</h3>
                      <p className="text-indigo-100 text-sm italic mb-4">"O Senhor é o meu pastor; nada me faltará." - Salmos 23:1</p>
                      <Button variant="secondary" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 border-0">Ler Capítulo</Button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl opacity-50"></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && <CalendarView events={events} onAddEvent={() => { }} />}
            {activeTab === 'services' && <ServicesManager events={events} onAddService={() => setShowServiceModal(true)} />}

            {activeTab === 'finance' && <FinanceDashboard />}

            {activeTab === 'teaching' && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="bg-brand-50 p-6 rounded-full mb-4"><GraduationCap size={48} className="text-brand-400" /></div>
                <h2 className="text-2xl font-bold text-surface-900">Área de Ensino</h2>
                <p className="text-surface-500 max-w-md mt-2">Módulo em desenvolvimento com o novo design system Minify.</p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
                <Card>
                  <div className="flex items-center gap-6 pb-6 border-b border-surface-100">
                    <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl" />
                    <div>
                      <h3 className="text-2xl font-bold text-surface-900">{user.name}</h3>
                      <p className="text-surface-500">{user.email}</p>
                      <Badge variant="brand" className="mt-2 uppercase">{user.role}</Badge>
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div>
                      <h4 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-brand-600" /> Ferramentas de Desenvolvedor
                      </h4>
                      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-bold text-rose-900">Resetar Experiência de Uso</div>
                            <div className="text-sm text-rose-600 mt-1">
                              Use esta opção para limpar seu progresso local e ver o processo de Onboarding e Tutorial novamente.
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            className="bg-white border-rose-200 text-rose-600 hover:bg-rose-100 whitespace-nowrap"
                            onClick={() => {
                              if (user?.id) {
                                localStorage.removeItem(`onboarding_${user.id}`);
                                localStorage.removeItem(`tutorial_seen_${user.id}`);
                                handleLogout();
                              }
                            }}
                          >
                            Resetar Agora
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* AI FAB */}
        <button onClick={() => setIsAIChatOpen(true)} className="absolute bottom-8 right-8 bg-surface-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group z-40 border border-surface-700">
          <Sparkles className="group-hover:animate-pulse" />
        </button>
      </main>

      {/* MODALS LAYER */}
      {showServiceModal && <CreateServiceModal onClose={() => setShowServiceModal(false)} onSave={(e: any) => { setEvents([...events, e]); setShowServiceModal(false) }} />}

      <AIChat userRole={user.role} isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Gamified Tutorial Overlay */}
      {view === 'app' && showTutorial && (
        <GamifiedTutorial onFinish={() => {
          if (user?.id) {
            localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
          }
          setShowTutorial(false);
        }} />
      )}
    </div>
  );
}