import { useState } from 'react';
import { Tournament } from '@/lib/types';
import { generatePlayoffs, updatePlayoffScore, clearPlayoffScore, getTeamName } from '@/lib/tournament-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Swords, Zap, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  tournament: Tournament;
  onChange: (t: Tournament) => void;
  readOnly?: boolean;
}

export function PlayoffBracket({ tournament, onChange, readOnly = false }: Props) {
  const [teamsPerPool, setTeamsPerPool] = useState(2);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const handleGenerate = () => {
    if (readOnly) return;
    onChange(generatePlayoffs(tournament, teamsPerPool));
  };

  const handleSaveScore = (matchId: string) => {
    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (readOnly || Number.isNaN(h) || Number.isNaN(a) || h < 0 || a < 0) return;
    const match = tournament.playoffs.find(m => m.id === matchId);
    if (h === a && !match?.isThirdPlace) {
      toast.error('Draws are not allowed in playoffs. One team must win.');
      return;
    }
    onChange(updatePlayoffScore(tournament, matchId, h, a));
    setEditingId(null);
    setHomeScore('');
    setAwayScore('');
  };

  const handleClearScore = (matchId: string) => {
    if (readOnly) return;
    onChange(clearPlayoffScore(tournament, matchId));
  };

  const rounds = [...new Set(tournament.playoffs.filter(m => !m.isThirdPlace).map((m) => m.round))].sort((a, b) => b - a);

  const getRoundName = (round: number): string => {
    if (round === 1) return 'Final';
    if (round === 2) return 'Semi-Finals';
    if (round === 4) return 'Quarter-Finals';
    return `Round of ${round * 2}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Swords className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-bold">Playoffs</h2>
      </div>

      {tournament.playoffs.length === 0 ? (
        <div className="stat-card text-center space-y-4 py-8">
          <p className="text-muted-foreground">Generate playoff bracket from pool standings</p>
          <div className="flex items-center justify-center gap-3">
            <label className="text-sm font-medium">Top teams per pool:</label>
            <Input
              type="number"
              min={1}
              max={8}
              value={teamsPerPool}
              onChange={(e) => setTeamsPerPool(parseInt(e.target.value, 10) || 2)}
              className="w-20 h-8"
              disabled={readOnly}
            />
            {!readOnly && (
              <Button
                onClick={handleGenerate}
                size="sm"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={tournament.pools.length === 0}
              >
                <Zap className="h-4 w-4 mr-1" /> Generate
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => onChange({ ...tournament, playoffs: [] })}>
              Reset Bracket
            </Button>
          )}

          <div className="flex gap-8 overflow-x-auto pb-4">
            {rounds.map((round) => (
              <div key={round} className="flex-shrink-0 space-y-3 min-w-[220px]">
                <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground text-center">
                  {getRoundName(round)}
                </h3>
                <div className="space-y-4" style={{ paddingTop: `${(rounds[0] / round - 1) * 40}px` }}>
                  {tournament.playoffs
                    .filter((m) => m.round === round && !m.isThirdPlace)
                    .sort((a, b) => a.position - b.position)
                    .map((match) => {
                      const isEditing = editingId === match.id;
                      const canEdit = Boolean(match.homeTeamId && match.awayTeamId);

                      return (
                        <div
                          key={match.id}
                          className={`rounded-lg border p-3 space-y-2 animate-slide-in ${
                            match.played ? 'bg-card border-secondary/30' : 'bg-card'
                          } ${round === 1 ? 'ring-2 ring-accent/30' : ''}`}
                          style={{ marginBottom: `${(rounds[0] / round - 1) * 40}px` }}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs flex-1 truncate">{getTeamName(tournament, match.homeTeamId)}</span>
                                <Input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="w-12 h-6 text-center text-xs" autoFocus />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs flex-1 truncate">{getTeamName(tournament, match.awayTeamId)}</span>
                                <Input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="w-12 h-6 text-center text-xs" onKeyDown={(e) => e.key === 'Enter' && handleSaveScore(match.id)} />
                              </div>
                              <Button size="sm" className="w-full h-6 text-xs" onClick={() => handleSaveScore(match.id)}>
                                <Check className="h-3 w-3 mr-1" /> Save Score
                              </Button>
                            </div>
                          ) : (
                            <div className="relative">
                              <button
                                className="w-full text-left space-y-1"
                                onClick={() => {
                                  if (!canEdit || readOnly) return;
                                  setEditingId(match.id);
                                  setHomeScore(match.homeScore?.toString() || '');
                                  setAwayScore(match.awayScore?.toString() || '');
                                }}
                                disabled={!canEdit || readOnly}
                              >
                                <div className={`flex justify-between text-sm ${match.played && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'font-bold' : ''}`}>
                                  <span className="truncate">{getTeamName(tournament, match.homeTeamId)}</span>
                                  {match.played && <span className="font-mono">{match.homeScore}</span>}
                                </div>
                                <div className={`flex justify-between text-sm ${match.played && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? 'font-bold' : ''}`}>
                                  <span className="truncate">{getTeamName(tournament, match.awayTeamId)}</span>
                                  {match.played && <span className="font-mono">{match.awayScore}</span>}
                                </div>
                              </button>
                              {!readOnly && match.played && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-1 -right-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleClearScore(match.id)}
                                  title="Clear score & reset"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {(() => {
            const thirdPlaceMatch = tournament.playoffs.find(m => m.isThirdPlace);
            if (!thirdPlaceMatch) return null;
            const isEditing = editingId === thirdPlaceMatch.id;
            const canEdit = Boolean(thirdPlaceMatch.homeTeamId && thirdPlaceMatch.awayTeamId);

            return (
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">
                  3rd Place
                </h3>
                <div className={`rounded-lg border p-3 space-y-2 max-w-[260px] ${thirdPlaceMatch.played ? 'bg-card border-secondary/30' : 'bg-card'}`}>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex-1 truncate">{getTeamName(tournament, thirdPlaceMatch.homeTeamId)}</span>
                        <Input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="w-12 h-6 text-center text-xs" autoFocus />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex-1 truncate">{getTeamName(tournament, thirdPlaceMatch.awayTeamId)}</span>
                        <Input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="w-12 h-6 text-center text-xs" onKeyDown={(e) => e.key === 'Enter' && handleSaveScore(thirdPlaceMatch.id)} />
                      </div>
                      <Button size="sm" className="w-full h-6 text-xs" onClick={() => handleSaveScore(thirdPlaceMatch.id)}>
                        <Check className="h-3 w-3 mr-1" /> Save Score
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        className="w-full text-left space-y-1"
                        onClick={() => {
                          if (!canEdit || readOnly) return;
                          setEditingId(thirdPlaceMatch.id);
                          setHomeScore(thirdPlaceMatch.homeScore?.toString() || '');
                          setAwayScore(thirdPlaceMatch.awayScore?.toString() || '');
                        }}
                        disabled={!canEdit || readOnly}
                      >
                        <div className={`flex justify-between text-sm ${thirdPlaceMatch.played && (thirdPlaceMatch.homeScore ?? 0) > (thirdPlaceMatch.awayScore ?? 0) ? 'font-bold' : ''}`}>
                          <span className="truncate">{getTeamName(tournament, thirdPlaceMatch.homeTeamId)}</span>
                          {thirdPlaceMatch.played && <span className="font-mono">{thirdPlaceMatch.homeScore}</span>}
                        </div>
                        <div className={`flex justify-between text-sm ${thirdPlaceMatch.played && (thirdPlaceMatch.awayScore ?? 0) > (thirdPlaceMatch.homeScore ?? 0) ? 'font-bold' : ''}`}>
                          <span className="truncate">{getTeamName(tournament, thirdPlaceMatch.awayTeamId)}</span>
                          {thirdPlaceMatch.played && <span className="font-mono">{thirdPlaceMatch.awayScore}</span>}
                        </div>
                      </button>
                      {!readOnly && thirdPlaceMatch.played && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleClearScore(thirdPlaceMatch.id)}
                          title="Clear score"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
