import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { POPULAR_JOB_TITLES } from "@/lib/constants";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobTitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  suggestions?: string[];
}

export default function JobTitleAutocomplete({
  value,
  onChange,
  placeholder,
  id,
  suggestions = POPULAR_JOB_TITLES,
}: JobTitleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    const list = q
      ? suggestions.filter((s) => s.toLowerCase().includes(q))
      : suggestions;
    // prioritize startsWith matches
    const sorted = [...list].sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
    return sorted.slice(0, 8);
  }, [value, suggestions]);

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      // only intercept if user is choosing a suggestion
      if (filtered[highlight] && filtered[highlight].toLowerCase() !== (value || "").toLowerCase()) {
        e.preventDefault();
        select(filtered[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showCustomHint =
    value.trim().length > 0 &&
    !filtered.some((s) => s.toLowerCase() === value.trim().toLowerCase());

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul className="max-h-64 overflow-auto py-1 text-sm">
            {filtered.map((s, i) => (
              <li
                key={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(s);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2",
                  i === highlight ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                )}
              >
                <span>{s}</span>
                {s.toLowerCase() === (value || "").trim().toLowerCase() && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </li>
            ))}
            {showCustomHint && (
              <li className="border-t mt-1 px-3 py-2 text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Press Enter or Tab to use “{value.trim()}” as a custom title
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
