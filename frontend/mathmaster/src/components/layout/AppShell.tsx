import * as React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
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
import { useSchoolStore } from '@/stores/schoolStore';
import { useSearchStore } from '@/stores/searchStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
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
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: Building2 },
  { label: 'Billing', href: '/admin/billing', icon: FileText },
  { label: 'School', href: '/admin/school', icon: Settings },
  { label: 'Audit Log', href: '/admin/audit', icon: BarChart3 },
];

// Section landing pages match exactly; everything else also matches its sub-routes (e.g. /documents/12).
const EXACT_ONLY = new Set(['/dashboard', '/teacher', '/admin']);
const isActivePath = (pathname: string, href: string) =>
  pathname === href || (!EXACT_ONLY.has(href) && pathname.startsWith(`${href}/`));

const roleLabel = (role?: string) => (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Student');

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const home = user?.role === 'teacher' ? '/teacher' : '/dashboard';
  return (
    <Link to={home} className={cn('flex items-center gap-2.5', collapsed && 'justify-center')} aria-label="MathMaster home">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white shadow-glow-brand">
        M
        <span className="absolute -right-1 -top-1 text-[10px] font-bold text-brand-600">π</span>
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">
          Math<span className="text-gradient-brand">Master</span>
        </span>
      )}
    </Link>
  );
}

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
        collapsed && 'justify-center px-0',
        active
          ? 'bg-brand-500 text-white shadow-soft'
          : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-brand-400',
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-ink-400 group-hover:text-brand-500')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-3 my-3 border-t border-ink-100 dark:border-ink-800" />;
  return <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-400 first:mt-0">{children}</p>;
}

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
  onClose,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const membership = useSchoolStore((s) => s.currentMembership);
  const school = useSchoolStore((s) => s.currentSchool);

  const mainNav = user?.role === 'teacher' ? teacherNav : studentNav;
  const canAdminister = membership?.role === 'owner' || membership?.role === 'admin';
  const initials = (user?.first_name || user?.username || 'M').slice(0, 1).toUpperCase();
  const profileHref = user?.role === 'teacher' ? '/teacher/profile' : '/profile';
  const displayRole = roleLabel(membership?.role ?? user?.role);

  const handleLogout = () => {
    logout();
    queryClient.clear(); // never leave one account's cached data for the next sign-in
    onNavigate?.();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900">
      <div className={cn('flex h-16 shrink-0 items-center border-b border-ink-100 dark:border-ink-800', collapsed ? 'justify-center' : 'justify-between px-5')}>
        <Logo collapsed={collapsed} />
        {onClose ? (
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        ) : (
          !collapsed && onToggle && (
            <button onClick={onToggle} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800" aria-label="Collapse sidebar">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* School context: always visible, outside the scroll area so its menu is never clipped. */}
      <div className={cn('shrink-0 border-b border-ink-100 p-3 dark:border-ink-800', collapsed && 'px-0')}>
        <SchoolSwitcher collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
        {mainNav.map((item) => <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
        {canAdminister && (
          <>
            <SectionLabel collapsed={collapsed}>{school?.name ? 'School admin' : 'Administration'}</SectionLabel>
            {adminNav.map((item) => <SidebarLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
          </>
        )}
      </nav>

      <div className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-800">
        {collapsed && onToggle && (
          <button onClick={onToggle} className="mb-2 flex w-full justify-center rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800" aria-label="Expand sidebar">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <div className={cn('flex items-center gap-3 rounded-xl bg-ink-50 p-2.5 dark:bg-ink-800', collapsed && 'flex-col bg-transparent p-0 dark:bg-transparent')}>
          <Link to={profileHref} onClick={onNavigate} title={collapsed ? 'Profile' : undefined}>
            <Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
          </Link>
          {!collapsed && (
            <Link to={profileHref} onClick={onNavigate} className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{user?.first_name || user?.username || 'Learner'}</p>
              <p className="truncate text-xs text-ink-400">{displayRole}</p>
            </Link>
          )}
          <button onClick={handleLogout} className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-rose-50 hover:text-danger dark:hover:bg-rose-500/10" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      {/* Desktop: a fixed-height column that sticks to the viewport, so only the page content scrolls. */}
      <div className={cn('hidden shrink-0 transition-[width] duration-200 md:block', collapsed ? 'w-20' : 'w-64')}>
        <aside className="sticky top-0 z-40 h-screen border-r border-ink-100 dark:border-ink-800">
          <SidebarContent collapsed={collapsed} onToggle={onToggle} />
        </aside>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm md:hidden" />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:hidden"
            >
              <SidebarContent collapsed={false} onNavigate={onMobileClose} onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const school = useSchoolStore((s) => s.currentSchool);
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
  const initials = (user?.first_name || user?.username || 'M').slice(0, 1).toUpperCase();
  const profileHref = user?.role === 'teacher' ? '/teacher/profile' : '/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-900/80 lg:px-8">
      <div className="flex min-w-0 items-center gap-3 md:hidden">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <Logo />
        </div>
      </div>

      <button onClick={openSearch} className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-left text-sm text-ink-400 transition-colors hover:border-brand-300 hover:text-ink-600 md:flex dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700">
        <Search className="h-4 w-4" />
        <span>Search anything...</span>
        <kbd className="ml-auto rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium dark:border-ink-600 dark:bg-ink-700">⌘ K</kbd>
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        {school && <span className="mr-1 hidden max-w-[180px] truncate rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 lg:block dark:text-brand-300">{school.name}</span>}
        <button onClick={openSearch} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 md:hidden dark:hover:bg-ink-800" aria-label="Search">
          <Search className="h-5 w-5" />
        </button>
        <button onClick={() => navigate('/notifications')} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
        <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:hover:bg-ink-800 dark:hover:text-ink-200" aria-label="Toggle theme">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Account menu">
              <Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate text-sm font-semibold">{user?.first_name || user?.username || 'My account'}</p>
              {user?.email && <p className="truncate text-xs font-normal text-ink-400">{user.email}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profileHref)}><CircleUserRound className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/notifications')}><Bell className="mr-2 h-4 w-4" /> Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); queryClient.clear(); navigate('/login'); }} className="text-danger focus:text-danger"><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

const COLLAPSE_KEY = 'mathmaster-sidebar-collapsed';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { theme, applyTheme } = useThemeStore();

  React.useEffect(() => { applyTheme(); }, [theme, applyTheme]);
  React.useEffect(() => { setMobileOpen(false); }, [pathname]);
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const toggleCollapsed = () =>
    setCollapsed((value) => {
      try { localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1'); } catch { /* ignore */ }
      return !value;
    });

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
