"use client";

import { Vote, X, ExternalLink } from "lucide-react";

type StrawPollWidgetProps = {
  /** StrawPoll ID (e.g. "eNg6vdev0gA") */
  pollId?: string;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export function StrawPollWidget({
  pollId = "eNg6vdev0gA",
  title = "Which Zengarden is better?",
  isOpen = true,
  onClose,
}: StrawPollWidgetProps) {
  if (!isOpen) return null;

  const embedUrl = `https://strawpoll.com/embed/${pollId}`;
  const pollUrl = `https://strawpoll.com/${pollId}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-glass p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Vote className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-foreground">{title}</h3>
            <p className="text-xs text-muted">Community Live Poll</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={pollUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
          >
            Open on StrawPoll <ExternalLink className="h-3 w-3" />
          </a>
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
        <div className="relative min-h-[420px] w-full overflow-hidden rounded-xl border border-border/50 bg-black/40">
          <iframe
            src={embedUrl}
            className="h-[420px] w-full border-0"
            title="StrawPoll Voting"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
