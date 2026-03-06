import { useState, useRef } from 'react';
import { UserRole } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy, Shield, Eye, Lock } from 'lucide-react';

const ADMIN_PASSWORD_KEY = 'tournament-admin-password';

function getStoredAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin';
}

interface Props {
  onLogin: (role: UserRole) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    const storedPassword = getStoredAdminPassword();
    if (password === storedPassword) {
      onLogin('admin');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl tournament-gradient">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tournament Manager</h1>
          <p className="text-muted-foreground">Select how you'd like to access the tournament</p>
        </div>

        <div className="space-y-4">
          {/* Viewer Access */}
          <button
            onClick={() => onLogin('viewer')}
            className="w-full stat-card flex items-center gap-4 text-left hover:ring-2 hover:ring-primary/30 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/30">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Viewer</p>
              <p className="text-sm text-muted-foreground">View standings, fixtures & brackets</p>
            </div>
          </button>

          {/* Admin Access */}
          {!showAdminForm ? (
            <button
              onClick={() => setShowAdminForm(true)}
              className="w-full stat-card flex items-center gap-4 text-left hover:ring-2 hover:ring-secondary/30 cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl tournament-gradient">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Admin</p>
                <p className="text-sm text-muted-foreground">Full access to manage the tournament</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="stat-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl tournament-gradient">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-lg">Admin Login</p>
                  <p className="text-sm text-muted-foreground">Enter admin password</p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setShowAdminForm(false); setPassword(''); setError(''); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdminLogin} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Default admin password: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">admin</code>
        </p>
      </div>
    </div>
  );
}
