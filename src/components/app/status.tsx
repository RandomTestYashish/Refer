import { Badge } from "@/components/ui/badge";
import { REWARD_META, STATUS_META } from "@/domain/status";
import type { ReferralStatus, RewardState } from "@/domain/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: ReferralStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <Badge variant={m.tone === "soft" ? "soft" : m.tone} className={className}>
      <span className={cn("size-1.5 rounded-full bg-current opacity-80")} />
      {m.label}
    </Badge>
  );
}

export function RewardBadge({ state, className }: { state: RewardState; className?: string }) {
  const m = REWARD_META[state];
  return (
    <Badge variant={m.tone === "soft" ? "soft" : m.tone} className={className}>
      {m.label}
    </Badge>
  );
}
