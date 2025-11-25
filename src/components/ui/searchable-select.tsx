import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustomValue?: boolean;
  className?: string;
};

// Small combobox-style select with type-to-filter and optional custom values.
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Type to search...",
  emptyText = "No results",
  allowCustomValue = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q) ||
        option.hint?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const selectedLabel =
    options.find((option) => option.value === value)?.label || value || "";

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
    setQuery("");
  };

  const canUseCustom = allowCustomValue && query.trim().length > 0 && !options.some((option) => option.value === query.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <span>{option.label}</span>
                {option.hint ? (
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                ) : null}
                {option.value === value ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </button>
            ))}
            {canUseCustom ? (
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="mt-1 flex w-full items-center justify-between rounded-sm bg-muted px-2 py-1.5 text-left text-sm hover:bg-muted/80"
              >
                <span>Use "{query.trim()}"</span>
              </button>
            ) : null}
            {!filteredOptions.length && !canUseCustom ? (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
