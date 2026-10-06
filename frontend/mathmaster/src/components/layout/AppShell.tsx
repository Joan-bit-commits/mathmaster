import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Building2,
  Camera,
  ChevronLeft,
  CircleUserRound,
  FileText,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  ScanLine,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSearchStore } from '@/stores/searchStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchModal } from '@/components/shared/SearchModal';
import { SchoolSwitcher } from '@/components/school/SchoolSwitcher';
import { useSchoolStore } from '@/stores/schoolStore';

type NavItem = { label: string; href: string; icon: React.ElementType };

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Topics', href: '/topics', icon: BookOpen },
  { label: 'Snap & Solve', href: '/scan', icon: Camera },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Curriculum', href: '/curriculum', icon: Library },
  { label: 'AI Tutor', href: '/ai-tutor', icon: Sparkles },
  { label: 'Performance', href: '/performance', icon: BarChart3 },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'Curriculum', href: '/teacher/curriculum', icon: Library },
  { label: 'Past Paper → Quiz', href: '/teacher/past-paper', icon: ScanLine },
  { label: 'Students', href: '/teacher/students', icon: Users },
  { label: 'Content', href: '/teacher/content', icon: BookOpen },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: Building2 },
  { label: 'Billing', href: '/admin/billing', icon: FileText },
  { label: 'School', href: '/admin/school', icon: Settings },
  { label: 'Audit Log', href: '/admin/audit', icon: BarChart3 },
];

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  const { user } = useAuthStore();
  const home = user?.role === 'teacher' ? '/teacher' : '/dashboard';
  return (
    <Link to={home} className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white shadow-glow-brand">
        M
        <span className="absolute -right-1 -top-1 text-[10px] font-bold text-brand-600">π</span>
      </div>
      {!collapsed && <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">Math<span className="text-gradient-brand">Master</span></span>}
    </Link>
  );
}

function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const openSearch = useSearchStore((s) => s.open);
  const { theme, setTheme } = useThemeStore();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const initials = user?.first_name?.slice(0, 1).toUpperCase() ?? 'M';
  const profileHref = user?.role === 'teacher' ? '/teacher/profile' : '/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/20 bg-white/80 px-4 backdrop-blur-xl dark:border-white/5 dark:bg-ink-900/80 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 md:hidden dark:hover:bg-ink-800" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="md:hidden"><Logo /></div>
      </div>
      <button onClick={openSearch} className="hidden w-full max-w-sm items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-left text-sm text-ink-400 transition-colors hover:border-brand-300 hover:text-ink-600 md:flex dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700">
        <Search className="h-4 w-4" />
        <span>Search anything...</span>
        <kbd className="ml-auto rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium dark:border-ink-600 dark:bg-ink-700">⌘ K</kbd>
      </button>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden lg:block"><SchoolSwitcher /></div>
        <button onClick={() => navigate('/notifications')} className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-danger dark:border-ink-900" />
        </button>
        <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Toggle theme">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800">
              <Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
              <div className="hidden text-left sm:block"><p className="max-w-[100px] truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{user?.first_name ?? 'Learner'}</p><p className="text-xs capitalize text-ink-400">{user?.role ?? 'student'}</p></div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profileHref)}><CircleUserRound className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/notifications')}><Bell className="mr-2 h-4 w-4" /> Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { void logout(); navigate('/login'); }} className="text-danger focus:text-danger"><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileClose: () => void }) {
  const location = window.location.pathname;
  const { user } = useAuthStore();
  const { currentMembership } = useSchoolStore();
  const isAdminRoute = location.startsWith('/admin');
  const navItems = isAdminRoute ? adminNav : user?.role === 'teacher' ? teacherNav : studentNav;
  const initials = user?.first_name?.slice(0, 1).toUpperCase() ?? 'M';
  const profileHref = user?.role === 'teacher' ? '/teacher/profile' : '/profile';

  const content = (
    <aside className={cn('flex h-full flex-col bg-white dark:bg-ink-900', collapsed ? 'w-20' : 'w-64')}>
      <div className={cn('flex h-16 items-center border-b border-ink-100 px-5 dark:border-ink-800', collapsed ? 'justify-center px-0' : 'justify-between')}>
        <Logo collapsed={collapsed} />
        {!collapsed && <button onClick={onToggle} className="hidden rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 md:block dark:hover:bg-ink-800"><ChevronLeft className="h-4 w-4" /></button>}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Workspace</p>}
        {navItems.map((item) => { const active = location === item.href; const Icon = item.icon; return <Link key={item.href} to={item.href} onClick={onMobileClose} className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all', collapsed && 'justify-center px-0', active ? 'bg-brand-500 text-white shadow-soft' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-brand-400')}><Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-ink-400 group-hover:text-brand-500')} />{!collapsed && <span>{item.label}</span>}</Link>; })}
        {!collapsed && <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400">Account</p>}
        {collapsed ? null : <><Link to={profileHref} onClick={onMobileClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-800"><CircleUserRound className="h-5 w-5 text-ink-400" /> Profile</Link><Link to="/settings" onClick={onMobileClose} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-800"><Settings className="h-5 w-5 text-ink-400" /> Settings</Link></>}
      </nav>
      <div className={cn('border-t border-ink-100 p-3 dark:border-ink-800', collapsed && 'flex justify-center')}>
        <div className={cn('flex items-center gap-3 rounded-xl bg-ink-50 p-2.5 dark:bg-ink-800', collapsed && 'bg-transparent p-0')}><Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>{!collapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{user?.first_name ?? 'Learner'}</p><Badge tone="brand" className="mt-0.5 capitalize">{user?.role ?? 'student'}</Badge></div>}</div>
      </div>
    </aside>
  );

  return <><div className="hidden h-screen shrink-0 md:block">{content}</div><AnimatePresence>{mobileOpen && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm md:hidden" /><motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">{content}<button onClick={onMobileClose} className="absolute right-3 top-5 rounded-lg p-1 text-ink-400 hover:bg-ink-100"><X className="h-5 w-5" /></button></motion.div></>}</AnimatePresence></>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { theme, applyTheme } = useThemeStore();

  React.useEffect(() => { applyTheme(); }, [theme, applyTheme]);

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={window.location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <SearchModal />
    </div>
  );
}

export { studentNav, teacherNav, adminNav };
