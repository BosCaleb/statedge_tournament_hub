import { useMemo } from 'react';
import { Tournament } from '@/lib/types';
import { calculateStandings, exportToCSV, getFormGuide } from '@/lib/tournament-store';
import { exportStandingsPDF } from '@/lib/pdf-export';
import { downloadFile } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trophy, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  tournament: Tournament;
}

const FORM_COLOURS: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-green-500 text-white',
  D: 'bg-yellow-400 text-yellow-900',
  L: 'bg-red-500 text-white',
};

export function StandingsView({ tournament }: Props) {
  const handleExport = (poolId: string, poolName: string) => {
    const standings = calculateStandings(tournament, poolId);
    downloadFile(exportToCSV(standings, poolName), `${poolName}-standings.csv`);
  };

  const standingsByPool = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateStandings>> = {};
    tournament.pools.forEach(pool => {
      map[pool.id] = calculateStandings(tournament, pool.id);
    });
    return map;
  }, [tournament.pools, tournament.fixtures, tournament.pointsForWin, tournament.pointsForDraw, tournament.pointsForLoss]);

  const topTeams = useMemo(() => {
    const allStandings = Object.values(standingsByPool).flat();
    return [...allStandings]
      .filter(s => s.played > 0)
      .sort((a, b) => b.goalsFor - a.goalsFor)
      .slice(0, 8);
  }, [standingsByPool]);

  const hasAnyResults = tournament.fixtures.some(f => f.played);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h2 className="text-xl">Standings</h2>
        </div>
        {tournament.pools.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportStandingsPDF(tournament)} className="uppercase tracking-wide text-xs font-bold">
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        )}
      </div>

      {tournament.pools.map(pool => {
        const standings = standingsByPool[pool.id] ?? [];
        if (standings.length === 0) return null;

        return (
          <div key={pool.id} className="space-y-2 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="espn-section-header flex-1">{pool.name}</div>
              <Button variant="outline" size="sm" onClick={() => handleExport(pool.id, pool.name)} className="ml-2 uppercase tracking-wide text-xs font-bold">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>

            <div className="rounded border overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[520px]">
                <thead>
                  <tr className="tournament-gradient text-primary-foreground">
                    <th className="text-left py-2 px-2 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">#</th>
                    <th className="text-left py-2 px-2 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Team</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">P</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">W</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">D</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">L</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">GF</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">GA</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">GD</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Pts</th>
                    <th className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider hidden sm:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => {
                    const form = getFormGuide(tournament, s.teamId, pool.id);
                    return (
                      <tr
                        key={s.teamId}
                        className={`border-t transition-colors ${
                          i === 0 ? 'bg-accent/10 font-semibold border-l-4 border-l-accent' : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="py-2 px-2 sm:py-2.5 sm:px-3 font-bold">{i + 1}</td>
                        <td className="py-2 px-2 sm:py-2.5 sm:px-3 font-medium truncate max-w-[120px]">{s.teamName}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3">{s.played}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-green-600 dark:text-green-400">{s.won}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3">{s.drawn}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 text-destructive">{s.lost}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3">{s.goalsFor}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3">{s.goalsAgainst}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 score-badge">
                          {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                        </td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 font-bold text-accent score-badge text-sm sm:text-base">{s.points}</td>
                        <td className="text-center py-2 px-1.5 sm:py-2.5 sm:px-3 hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-0.5">
                            {form.length === 0 ? (
                              <span className="text-[9px] text-muted-foreground">-</span>
                            ) : (
                              form.map((result, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center justify-center h-4 w-4 rounded-sm text-[9px] font-bold ${FORM_COLOURS[result]}`}
                                >
                                  {result}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Tie-break: Points → GD → GF → Head-to-Head → Alphabetical
            </p>
          </div>
        );
      })}

      {hasAnyResults && topTeams.length > 0 && (
        <div className="space-y-2 animate-slide-in">
          <div className="espn-section-header">Goals Scored — Top Teams</div>
          <div className="rounded border bg-card p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topTeams} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <XAxis
                  dataKey="teamName"
                  tick={{ fontSize: 10, fontFamily: 'Oswald, sans-serif' }}
                  tickFormatter={(v: string) => v.length > 8 ? v.slice(0, 8) + '…' : v}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                  formatter={(value: number) => [value, 'Goals']}
                />
                <Bar dataKey="goalsFor" radius={[3, 3, 0, 0]}>
                  {topTeams.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'hsl(48 100% 50%)' : 'hsl(222 47% 35%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tournament.pools.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Create pools and play matches to see standings
        </p>
      )}
    </div>
  );
}
