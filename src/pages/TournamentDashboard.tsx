import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Users, Calendar, Shield, Eye, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  listTournaments,
  createTournament,
  getSessionProfile,
  signIn,
  signOut,
} from '@/lib/tournament-api';

type TournamentSummary = {
  id: string;
  name: string;
  managerName: string;
  logo: string | null;
  teamCount: number;
  createdAt: string;
};

const TournamentDashboard = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [newName, setNewName] = useState('');
  const [newManager, setNewManager] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [sessionInfo, list] = await Promise.all([
        getSessionProfile(),
        listTournaments(),
      ]);
      setIsAdmin(sessionInfo.profile?.role === 'admin');
      setTournaments(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Enter your email and password.');
      return;
    }
    try {
      setLoginBusy(true);
      setLoginError('');
      await signIn(loginEmail.trim(), loginPassword);
      const sessionInfo = await getSessionProfile();
      if (sessionInfo.profile?.role !== 'admin') {
        toast.error('This account is not an admin. Promote it in Supabase first.');
        await signOut();
        return;
      }
      setIsAdmin(true);
      setShowLoginDialog(false);
      setLoginEmail('');
      setLoginPassword('');
      await load();
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed.');
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      // ignore
    }
    setIsAdmin(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      setCreating(true);
      const id = await createTournament(newName.trim(), newManager.trim() || 'Tournament Manager');
      toast.success('Tournament created');
      setShowCreateDialog(false);
      setNewName('');
      setNewManager('');
      navigate(`/t/${id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create tournament');
    } finally {
      setCreating(false);
    }
  }

  function openTournament(id: string) {
    navigate(`/t/${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Trophy className="h-10 w-10 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 gold-gradient" />
      <header className="tournament-gradient text-white">
        <div className="container py-3 px-4 sm:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-accent flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                  StatEdge
                </h1>
                <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-widest">Tournament Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Sun className="h-3 w-3 text-white/60" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-3 w-3 text-white/60" />
              </div>
              {isAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => void handleLogout()} className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2">
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline text-xs uppercase tracking-wide">Admin</span>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowLoginDialog(true)} className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline text-xs uppercase tracking-wide">Admin Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-1 gold-gradient" />

      <main className="container py-6 px-4 sm:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wide">Tournaments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAdmin ? 'Select a tournament to manage or create a new one.' : 'Select a tournament to view standings and results.'}
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowCreateDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-wide">
              <Plus className="h-4 w-4 mr-1" /> New Tournament
            </Button>
          )}
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">No tournaments yet.</p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-1" /> Create your first tournament
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => openTournament(t.id)}
                className="stat-card text-left group cursor-pointer flex items-start gap-3 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0 h-12 w-12 rounded bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                  {t.logo ? (
                    <img src={t.logo} alt="" className="h-12 w-12 object-cover" />
                  ) : (
                    <Trophy className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm uppercase tracking-wide truncate group-hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{t.managerName}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" /> {t.teamCount} teams
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <span className="text-[10px] font-bold text-accent/60 uppercase tracking-wide flex-shrink-0">
                    <Eye className="h-3 w-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Admin Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" /> Admin Login
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={loginBusy}
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleLogin()}
              disabled={loginBusy}
            />
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowLoginDialog(false); setLoginError(''); }} disabled={loginBusy}>
              Cancel
            </Button>
            <Button onClick={() => void handleLogin()} disabled={loginBusy} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loginBusy ? 'Signing in...' : 'Sign in'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tournament Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" /> New Tournament
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tournament Name</label>
              <Input
                placeholder="e.g. Summer Cup 2025"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Manager Name</label>
              <Input
                placeholder="e.g. John Smith"
                value={newManager}
                onChange={(e) => setNewManager(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setNewName(''); setNewManager(''); }} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={creating || !newName.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tournament and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TournamentDashboard;
