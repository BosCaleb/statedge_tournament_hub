import { useState, useEffect } from 'react';
import { Tournament } from '@/lib/types';
import { loadTournament, getTeamName, calculateStandings } from '@/lib/tournament-store';
import { Trophy, MapPin, Clock } from 'lucide-react';

const Scoreboard = () => {
  const [tournament, setTournament] = useState<Tournament>(loadTournament);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTournament(loadTournament());
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveFixtures = tournament.fixtures.filter(f => !f.played);
  const recentResults = tournament.fixtures
    .filter(f => f.played)
    .slice(-6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="h-1.5 gold-gradient" />
      <header className="tournament-gradient text-primary-foreground py-4 sm:py-6">
        <div className="container px-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tournament.logo ? (
                <img src={tournament.logo} alt="" className="h-10 w-10 sm:h-16 sm:w-16 rounded object-cover border-2 border-accent/40" />
              ) : (
                <div className="h-10 w-10 sm:h-16 sm:w-16 rounded bg-accent/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 sm:h-9 sm:w-9 text-accent" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  {tournament.name}
                </h1>
                <p className="text-[10px] sm:text-sm text-primary-foreground/60 uppercase tracking-widest">
                  Live Scoreboard
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] sm:text-xs text-primary-foreground/60 uppercase">
                Auto-refreshing
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="h-1.5 gold-gradient" />

      <main className="container px-4 sm:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Upcoming / In-Progress Matches */}
        {liveFixtures.length > 0 && (
          <section>
            <div className="espn-section-header text-sm sm:text-base mb-3 sm:mb-4">Upcoming Matches</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {liveFixtures.slice(0, 9).map(fixture => {
                const pool = tournament.pools.find(p => p.id === fixture.poolId);
                return (
                  <div key={fixture.id} className="rounded border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 border-l-4 border-l-accent">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                        {pool?.name} · Round {fixture.round}
                      </span>
                      {fixture.date && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {fixture.date}{fixture.time ? ` ${fixture.time}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm sm:text-xl flex-1 text-right truncate">
                        {getTeamName(tournament, fixture.homeTeamId)}
                      </span>
                      <span className="px-3 sm:px-5 py-1.5 sm:py-2 rounded bg-muted text-muted-foreground font-bold text-sm sm:text-xl score-badge">
                        VS
                      </span>
                      <span className="font-bold text-sm sm:text-xl flex-1 truncate">
                        {getTeamName(tournament, fixture.awayTeamId)}
                      </span>
                    </div>
                    {fixture.venue && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {fixture.venue}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <section>
            <div className="espn-section-header text-sm sm:text-base mb-3 sm:mb-4">Recent Results</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentResults.map(fixture => {
                const pool = tournament.pools.find(p => p.id === fixture.poolId);
                return (
                  <div key={fixture.id} className="rounded border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                      {pool?.name} · Round {fixture.round}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold text-sm sm:text-xl flex-1 text-right truncate ${fixture.homeScore! > fixture.awayScore! ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {getTeamName(tournament, fixture.homeTeamId)}
                      </span>
                      <span className="px-3 sm:px-5 py-1.5 sm:py-2 rounded bg-primary text-primary-foreground font-bold text-sm sm:text-xl score-badge">
                        {fixture.homeScore} - {fixture.awayScore}
                      </span>
                      <span className={`font-bold text-sm sm:text-xl flex-1 truncate ${fixture.awayScore! > fixture.homeScore! ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {getTeamName(tournament, fixture.awayTeamId)}
                      </span>
                    </div>
                    {fixture.venue && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {fixture.venue}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pool Standings */}
        {tournament.pools.map(pool => {
          const standings = calculateStandings(tournament, pool.id);
          if (standings.length === 0) return null;
          return (
            <section key={pool.id}>
              <div className="espn-section-header text-sm sm:text-base mb-3 sm:mb-4">{pool.name} Standings</div>
              <div className="overflow-x-auto rounded border">
                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr className="tournament-gradient text-primary-foreground">
                      <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">#</th>
                      <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Team</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase">P</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase">W</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase">D</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase">L</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase">GD</th>
                      <th className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => (
                      <tr key={s.teamId} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 font-bold text-muted-foreground">{i + 1}</td>
                        <td className="py-2 sm:py-2.5 px-2 sm:px-3 font-bold">{s.teamName}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2">{s.played}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2">{s.won}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2">{s.drawn}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2">{s.lost}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2">{s.goalDifference}</td>
                        <td className="text-center py-2 sm:py-2.5 px-1 sm:px-2 font-bold text-accent">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        {tournament.fixtures.length === 0 && (
          <p className="text-muted-foreground text-center py-16 text-sm sm:text-lg">No fixtures scheduled yet</p>
        )}
      </main>
    </div>
  );
};

export default Scoreboard;
