import { useState } from 'react';
import { Tournament } from '@/lib/types';
import { addTeam, addPool, assignTeamToPool, generateFixtures } from '@/lib/tournament-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Users, Layers, Calendar, ChevronRight, Plus, X, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  tournament: Tournament;
  onChange: (t: Tournament) => void;
  onDismiss: () => void;
}

type Step = 'teams' | 'pools' | 'fixtures' | 'done';

export function SetupWizard({ tournament, onChange, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('teams');
  const [teamName, setTeamName] = useState('');
  const [poolName, setPoolName] = useState('');

  const steps: Step[] = ['teams', 'pools', 'fixtures', 'done'];
  const stepIndex = steps.indexOf(step);

  const stepMeta = [
    { label: 'Teams', icon: Users },
    { label: 'Pools', icon: Layers },
    { label: 'Fixtures', icon: Calendar },
    { label: 'Done', icon: Trophy },
  ];

  const handleAddTeam = () => {
    if (!teamName.trim()) return;
    onChange(addTeam(tournament, teamName.trim()));
    setTeamName('');
  };

  const handleAddPool = () => {
    if (!poolName.trim()) return;
    onChange(addPool(tournament, poolName.trim()));
    setPoolName('');
  };

  const handleGenerateAll = () => {
    let t = tournament;
    tournament.pools.forEach(pool => {
      if (pool.teamIds.length >= 2) {
        t = generateFixtures(t, pool.id);
      }
    });
    onChange(t);
    const count = t.fixtures.filter(f => tournament.pools.some(p => p.id === f.poolId)).length;
    toast.success(`Generated ${count} fixtures`);
    setStep('done');
  };

  const canProceedToPool = tournament.teams.length >= 2;
  const canProceedToFixtures = tournament.pools.length > 0 && tournament.pools.some(p => p.teamIds.length >= 2);
  const unassignedTeams = tournament.teams.filter(t => !t.poolId);

  return (
    <div className="rounded-lg border bg-card p-5 sm:p-6 space-y-5 border-t-4 border-t-accent shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h3 className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            Quick Setup
          </h3>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0">
        {stepMeta.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={s.label} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
                isActive ? 'bg-accent text-accent-foreground' :
                isDone ? 'text-accent' : 'text-muted-foreground'
              }`}>
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < stepMeta.length - 1 && (
                <ChevronRight className={`h-3 w-3 flex-shrink-0 mx-0.5 ${isDone || isActive ? 'text-accent' : 'text-muted-foreground/40'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 'teams' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Add the teams competing in this tournament.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddTeam} disabled={!teamName.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tournament.teams.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tournament.teams.map(team => (
                <span key={team.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                  {team.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">{tournament.teams.length} team{tournament.teams.length !== 1 ? 's' : ''} added</p>
            <Button size="sm" onClick={() => setStep('pools')} disabled={!canProceedToPool} className="font-bold uppercase tracking-wide text-xs">
              Next: Pools <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 'pools' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Create pools (groups) and assign teams to them.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Pool name (e.g. Pool A)..."
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPool()}
              autoFocus
            />
            <Button size="sm" onClick={handleAddPool} disabled={!poolName.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tournament.pools.map(pool => {
            const poolTeams = tournament.teams.filter(t => t.poolId === pool.id);
            return (
              <div key={pool.id} className="rounded border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide">{pool.name} ({poolTeams.length} teams)</p>
                {unassignedTeams.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {unassignedTeams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => onChange(assignTeamToPool(tournament, team.id, pool.id))}
                        className="text-xs bg-background border rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors font-medium"
                      >
                        + {team.name}
                      </button>
                    ))}
                  </div>
                )}
                {poolTeams.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {poolTeams.map(team => (
                      <span key={team.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                        {team.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {unassignedTeams.length > 0 && tournament.pools.length > 0 && (
            <p className="text-xs text-muted-foreground">{unassignedTeams.length} unassigned team{unassignedTeams.length !== 1 ? 's' : ''}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <Button variant="outline" size="sm" onClick={() => setStep('teams')}>
              Back
            </Button>
            <Button size="sm" onClick={() => setStep('fixtures')} disabled={!canProceedToFixtures} className="font-bold uppercase tracking-wide text-xs">
              Next: Fixtures <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 'fixtures' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate round-robin fixtures for each pool automatically.
          </p>
          <div className="space-y-2">
            {tournament.pools.map(pool => {
              const poolTeams = tournament.teams.filter(t => t.poolId === pool.id);
              const matches = (poolTeams.length * (poolTeams.length - 1)) / 2;
              return (
                <div key={pool.id} className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2">
                  <div>
                    <p className="text-sm font-bold">{pool.name}</p>
                    <p className="text-xs text-muted-foreground">{poolTeams.length} teams · {matches} matches</p>
                  </div>
                  {poolTeams.length >= 2 ? (
                    <span className="text-xs text-accent font-bold">Ready</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Need ≥2 teams</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Button variant="outline" size="sm" onClick={() => setStep('pools')}>
              Back
            </Button>
            <Button size="sm" onClick={handleGenerateAll} disabled={!canProceedToFixtures} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-wide text-xs">
              <Zap className="h-3.5 w-3.5 mr-1" /> Generate All Fixtures
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center space-y-3 py-2">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <Trophy className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="font-bold text-sm uppercase tracking-wide">Tournament is ready!</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tournament.fixtures.length} fixtures generated across {tournament.pools.length} pool{tournament.pools.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <Button size="sm" onClick={onDismiss} className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold uppercase tracking-wide text-xs">
            Start Managing
          </Button>
        </div>
      )}
    </div>
  );
}
