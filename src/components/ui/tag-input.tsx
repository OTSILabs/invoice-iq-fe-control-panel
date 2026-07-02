import type { TagInputProps } from "@/types";
import { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";



const EMPTY_VALUE: string[] = [];

function TagInput({
  value = EMPTY_VALUE,
  onChange,
  disabled = false,
  placeholder = "Type and press Enter",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const tags = Array.isArray(value) ? value : [];

  function addTag(rawTag: string) {
    const tag = rawTag.trim();

    if (!tag || tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setInputValue("");
      return;
    }

    onChange([...tags, tag]);
    setInputValue("");
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  return (
    <fieldset
      data-slot="tag-input"
      aria-label="Tags input"
      disabled={disabled}
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-4xl border border-input bg-background px-2 py-1 shadow-[0_1px_1px_rgba(15,23,42,0.04)] transition-[color,box-shadow,border-color,background-color] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      // Interaction moved to the accessible button to avoid handlers on non-interactive elements
    >
      <button
        type="button"
        className="sr-only"
        aria-label="Focus tags input"
        onClick={(event) => {
          event.stopPropagation();
          (event.currentTarget.parentElement as HTMLElement)?.querySelector("input")?.focus();
        }}
      />
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="h-6 gap-1 rounded-md border-primary/20 bg-primary/10 px-2 shadow-none hover:bg-primary/15"
        >
          <span className="max-w-48 truncate">{tag}</span>
          <button
            type="button"
            className="rounded-sm opacity-70 hover:opacity-100 disabled:pointer-events-none"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              removeTag(tag);
            }}
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      <input
        aria-label="Tags"
        value={inputValue}
        disabled={disabled}
        placeholder={tags.length ? "" : placeholder}
        className="h-7 min-w-32 flex-1 border-0 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(inputValue);
          }

          if (event.key === "Backspace" && !inputValue && tags.length) {
            removeTag(tags[tags.length - 1]);
          }
        }}
      />
    </fieldset>
  );
}

export { TagInput };
