"use client";

import { useState } from "react";
import { Vote, X, ExternalLink, Sparkles } from "lucide-react";

type StrawPollWidgetProps = {
  /** StrawPoll ID (e.g. "Q0Zp7O8xZYM" or custom poll ID created on strawpoll.com) */
  pollId?: string;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export function StrawPollWidget({
  pollId: initialPollId = "eNg6vdev0gA",
  title = "Vote for the Best Zen Garden",
  isOpen = true,
  onClose,
}: StrawPollWidgetProps) {
  const [pollId, setPollId] = useState(initialPollId);
  const [isEditing, setIsEditing] = useState(!initialPollId);
  const [tempId, setTempId] = useState(initialPollId);

  if (!isOpen) return null;

  const embedUrl = pollId ? `https://strawpoll.com/embed/${pollId}` : null;
  const pollUrl = pollId ? `https://strawpoll.com/${pollId}` : "https://strawpoll.com/create";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-glass p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Vote className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-foreground">{title}</h3>
            <p className="text-xs text-muted">Powered by StrawPoll · Zero DB required</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pollId && (
            <a
              href={pollUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
            >
              Open on StrawPoll <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {embedUrl ? (
          <div className="relative min-h-[380px] w-full overflow-hidden rounded-xl border border-border/50 bg-black/40">
            <iframe
              src={embedUrl}
              className="h-[380px] w-full border-0"
              title="StrawPoll Voting"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-medium text-foreground">Connect your StrawPoll</h4>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Create a free poll on <a href="https://strawpoll.com/create" target="_blank" rel="noopener noreferrer" className="text-accent underline">strawpoll.com</a> and paste your Poll ID below to display live voting!
            </p>

            <div className="mt-4 flex w-full max-w-xs gap-2">
              <input
                type="text"
                placeholder="Enter StrawPoll ID (e.g. Q0Zp7O8xZYM)"
                value={tempId}
                onChange={(e) => setTempId(e.target.value.trim())}
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (tempId) {
                    setPollId(tempId);
                    setIsEditing(false);
                  }
                }}
                className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {pollId && !isEditing && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>Poll ID: <code className="text-accent">{pollId}</code></span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-muted underline hover:text-foreground"
          >
            Change Poll ID
          </button>
        </div>
      )}

      {isEditing && pollId && (
        <div className="mt-3 flex w-full max-w-xs items-center gap-2">
          <input
            type="text"
            placeholder="New StrawPoll ID"
            value={tempId}
            onChange={(e) => setTempId(e.target.value.trim())}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1 text-xs text-foreground placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => {
              if (tempId) {
                setPollId(tempId);
                setIsEditing(false);
              }
            }}
            className="rounded-lg bg-accent px-2.5 py-1 text-xs text-accent-foreground"
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
}
