import { Tournament } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface Props {
  tournament: Tournament;
  onChange: (t: Tournament) => void;
}

export function SettingsTab({ tournament, onChange }: Props) {
  const update = (field: 'pointsForWin' | 'pointsForDraw' | 'pointsForLoss', value: string) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    onChange({ ...tournament, [field]: num });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-accent" />
        <h2 className="text-xl">Settings</h2>
      </div>

      <div className="rounded border bg-card p-5 space-y-5 border-l-4 border-l-accent">
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Points System
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Win</label>
            <Input
              type="number"
              min={0}
              max={10}
              value={tournament.pointsForWin}
              onChange={(e) => update('pointsForWin', e.target.value)}
              onBlur={() => onChange(tournament)}
              className="text-center text-lg font-bold h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Draw</label>
            <Input
              type="number"
              min={0}
              max={10}
              value={tournament.pointsForDraw}
              onChange={(e) => update('pointsForDraw', e.target.value)}
              onBlur={() => onChange(tournament)}
              className="text-center text-lg font-bold h-12"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Loss</label>
            <Input
              type="number"
              min={0}
              max={10}
              value={tournament.pointsForLoss}
              onChange={(e) => update('pointsForLoss', e.target.value)}
              onBlur={() => onChange(tournament)}
              className="text-center text-lg font-bold h-12"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Standard: Win = 3, Draw = 1, Loss = 0. Changes apply immediately to all standings.
        </p>
      </div>
    </div>
  );
}
