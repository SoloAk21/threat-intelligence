// src/components/SaveButton.tsx
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ThreatData } from "@/types/threat";

interface SaveButtonProps {
  analysisId: string;
  data: ThreatData;
  onSaved?: () => void;
}

export function SaveButton({ analysisId, data, onSaved }: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post("/save", {
        analysisId,
        notes,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      if (response.data.success) {
        toast.success("Analysis saved to your collection");
        setShowModal(false);
        setNotes("");
        setTags("");
        onSaved?.();
      }
    } catch (err: any) {
      if (err.response?.data?.error?.includes("already saved")) {
        toast.info("Analysis already saved");
      } else {
        toast.error("Failed to save analysis");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs hover:bg-muted/50 transition-colors"
      >
        <Bookmark className="h-3.5 w-3.5" />
        Save
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-[400px] max-w-[90vw] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide">
                Save Analysis
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-muted/50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-xs bg-muted/30 border border-border/30 rounded focus:outline-none focus:border-brand-primary/50"
                rows={3}
                placeholder="Add your notes about this indicator..."
              />
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-medium text-muted-foreground uppercase">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="malware, c2, phishing"
                className="w-full mt-1 px-2 py-1.5 text-xs bg-muted/30 border border-border/30 rounded focus:outline-none focus:border-brand-primary/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-1.5 bg-brand-primary text-white text-[10px] font-medium rounded hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-1"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <BookmarkCheck className="h-3 w-3" />
                )}
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-1.5 bg-muted/30 text-muted-foreground text-[10px] font-medium rounded hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
