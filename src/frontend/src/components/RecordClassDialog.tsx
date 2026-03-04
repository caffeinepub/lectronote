import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddPeriod } from "@/hooks/useQueries";
import { Loader2, Mic } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RecordClassDialogProps {
  classId: bigint;
  date: string; // YYYYMMDD
  displayDate: string;
}

export function RecordClassDialog({
  classId,
  date,
  displayDate,
}: RecordClassDialogProps) {
  const [open, setOpen] = useState(false);
  const [periodNumber, setPeriodNumber] = useState("");
  const [summaryPrimary, setSummaryPrimary] = useState("");
  const [summarySecondary, setSummarySecondary] = useState("");
  const [error, setError] = useState("");

  const addPeriod = useAddPeriod();

  const resetForm = () => {
    setPeriodNumber("");
    setSummaryPrimary("");
    setSummarySecondary("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pNum = Number.parseInt(periodNumber, 10);
    if (!periodNumber || Number.isNaN(pNum) || pNum < 1) {
      setError("Please enter a valid period number (≥ 1)");
      return;
    }
    if (!summaryPrimary.trim()) {
      setError("Primary language summary is required");
      return;
    }
    if (!summarySecondary.trim()) {
      setError("Secondary language summary is required");
      return;
    }

    addPeriod.mutate(
      {
        classId,
        date,
        periodNumber: BigInt(pNum),
        summaryPrimary: summaryPrimary.trim(),
        summarySecondary: summarySecondary.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Period ${pNum} recorded for ${displayDate}`);
          setOpen(false);
          resetForm();
        },
        onError: () => {
          setError("Failed to save period. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 font-semibold"
          data-ocid="record.open_modal_button"
        >
          <Mic className="h-5 w-5" />
          Record Today's Class
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg" data-ocid="record.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Record Class Session
          </DialogTitle>
          <DialogDescription>
            Add a period entry for{" "}
            <span className="font-medium text-foreground">{displayDate}</span>.
            Provide summaries in both languages for bilingual access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="period-number">Period Number</Label>
            <Input
              id="period-number"
              type="number"
              min={1}
              placeholder="e.g. 1"
              value={periodNumber}
              onChange={(e) => setPeriodNumber(e.target.value)}
              data-ocid="record.period.input"
              className="h-10"
              disabled={addPeriod.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary-primary">Summary (Primary Language)</Label>
            <Textarea
              id="summary-primary"
              placeholder="Enter the class summary in your primary language..."
              value={summaryPrimary}
              onChange={(e) => setSummaryPrimary(e.target.value)}
              data-ocid="record.summary_primary.textarea"
              className="min-h-[90px] resize-none"
              disabled={addPeriod.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary-secondary">Summary (Second Language)</Label>
            <Textarea
              id="summary-secondary"
              placeholder="Enter the class summary in the second language..."
              value={summarySecondary}
              onChange={(e) => setSummarySecondary(e.target.value)}
              data-ocid="record.summary_secondary.textarea"
              className="min-h-[90px] resize-none"
              disabled={addPeriod.isPending}
            />
          </div>

          {error && (
            <Alert variant="destructive" data-ocid="record.error_state">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addPeriod.isPending}
              data-ocid="record.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addPeriod.isPending}
              data-ocid="record.submit_button"
            >
              {addPeriod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
