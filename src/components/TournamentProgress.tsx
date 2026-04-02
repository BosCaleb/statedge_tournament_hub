import { Tournament } from '@/lib/types';
import { Check, Circle } from 'lucide-react';

interface Props {
  tournament: Tournament;
}

type Phase = {
  label: string;
  done: boolean;
  active: boolean;
};

export function TournamentProgress({ tournament }: Props) {
  const hasTeams = tournament.teams.length >= 2;
  const hasPools = tournament.pools.length > 0 && tournament.pools.some(p => p.teamIds.length >= 2);
  const hasFixtures = tournament.fixtures.length > 0;
  const hasResults = tournament.fixtures.some(f => f.played);
  const allGroupDone = hasFixtures && tournament.fixtures.every(f => f.played);
  const hasPlayoffs = tournament.playoffs.length > 0;
  const playoffsDone = hasPlayoffs && tournament.playoffs.filter(m => !m.isThirdPlace).every(m => m.played || (!m.homeTeamId && !m.awayTeamId) || (m.homeTeamId && m.awayTeamId && m.played));

  const phases: Phase[] = [
    { label: 'Teams', done: hasTeams, active: !hasTeams },
    { label: 'Pools', done: hasPools, active: hasTeams && !hasPools },
    { label: 'Fixtures', done: hasFixtures, active: hasPools && !hasFixtures },
    { label: 'Group Stage', done: allGroupDone, active: hasFixtures && !allGroupDone },
    { label: 'Playoffs', done: playoffsDone, active: allGroupDone && !hasPlayoffs },
    { label: 'Complete', done: playoffsDone && hasPlayoffs, active: hasPlayoffs && !playoffsDone },
  ];

  const activeIndex = phases.findIndex(p => p.active);
  const progressPct = activeIndex === -1
    ? (phases.every(p => p.done) ? 100 : 0)
    : Math.round((activeIndex / (phases.length - 1)) * 100);

  return (
    <div className="rounded border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Tournament Progress
        </p>
        <p className="text-[10px] font-bold text-accent">{progressPct}%</p>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-accent h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        {phases.map((phase, i) => (
          <div key={phase.label} className="flex flex-col items-center gap-0.5">
            <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
              phase.done ? 'bg-accent text-accent-foreground' :
              phase.active ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {phase.done ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </div>
            <span className={`text-[8px] sm:text-[9px] uppercase tracking-wide font-bold hidden sm:block ${
              phase.done ? 'text-accent' :
              phase.active ? 'text-foreground' :
              'text-muted-foreground/50'
            }`}>
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
