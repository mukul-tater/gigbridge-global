import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface SavedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, alertsEnabled: boolean, alertFrequency: string) => Promise<void>;
}

export default function SavedSearchDialog({ open, onOpenChange, onSave }: SavedSearchDialogProps) {
  const [name, setName] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertFrequency, setAlertFrequency] = useState('daily');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setSaving(true);
    try {
      await onSave(name, alertsEnabled, alertFrequency);
      setName('');
      setAlertsEnabled(false);
      setAlertFrequency('daily');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save this search to quickly access it later and receive alerts for new matches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name *</Label>
            <Input
              id="search-name"
              placeholder="e.g., Senior Welders in UAE"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alerts"
                checked={alertsEnabled}
                onCheckedChange={(checked) => setAlertsEnabled(checked as boolean)}
              />
              <Label htmlFor="alerts" className="cursor-pointer">
                Enable alerts for new matches
              </Label>
            </div>

            {alertsEnabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="frequency">Alert Frequency</Label>
                <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
