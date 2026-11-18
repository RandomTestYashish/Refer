import { toast } from "sonner";
import { CalendarX2, LinkIcon, MessageSquareText } from "lucide-react";
import { AppBar, Screen, SimNote } from "@/components/app/primitives";
import { ErrorState } from "@/components/app/ErrorState";
import { REFERRER } from "@/domain/data";
import { useProto } from "@/store/useProto";

/** User B link-level errors: invalid link, expired link, no invite. */
export function FriendErrorScreen({ params }: { params?: Record<string, string> }) {
  const resetTo = useProto((s) => s.resetTo);
  const rules = useProto((s) => s.rules);
  const kind = params?.kind ?? "invalid_link";

  if (kind === "expired_link")
    return (
      <Screen>
        <AppBar title="" onBack={() => resetTo("b_sms")} />
        <ErrorState
          icon={<CalendarX2 />}
          tone="neutral"
          title="This invite has expired"
          body={`Invitation links are valid for ${rules.linkValidityHours} hours. Ask ${REFERRER.first} to send you a new one — you'll still get the same rewards.`}
          primary={{
            label: `Ask ${REFERRER.first} for a new link`,
            onClick: () => toast.success("Request sent", { description: `${REFERRER.first} will be notified to resend your invite (simulated).` }),
          }}
          secondary={{ label: "Back to Messages", onClick: () => resetTo("b_sms") }}
        >
          <SimNote>Resend from User A (dashboard) or the panel — a new SMS arrives</SimNote>
        </ErrorState>
      </Screen>
    );

  if (kind === "no_invite")
    return (
      <Screen>
        <AppBar title="" onBack={() => resetTo("b_sms")} />
        <ErrorState
          icon={<MessageSquareText />}
          tone="neutral"
          title="No invitation found"
          body="There's no referral invitation on this phone yet."
          primary={{ label: "Back to Messages", onClick: () => resetTo("b_sms") }}
        />
      </Screen>
    );

  return (
    <Screen>
      <AppBar title="" onBack={() => resetTo("b_sms")} />
      <ErrorState
        icon={<LinkIcon />}
        title="This link isn't valid"
        body="The invite link looks broken or incomplete — it may have been cut off when copied. Ask your friend to share it again."
        primary={{
          label: "Ask friend to resend",
          onClick: () => toast.success("Request sent", { description: "Your friend will be asked to share a fresh link (simulated)." }),
        }}
        secondary={{ label: "Back to Messages", onClick: () => resetTo("b_sms") }}
      >
        <SimNote>Set “Link” to Valid in the panel to recover</SimNote>
      </ErrorState>
    </Screen>
  );
}
