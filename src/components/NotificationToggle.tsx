import { toggleConversationNotifications } from "@/lib/coach-actions";
import { textLinkClass } from "@/lib/ui-styles";

export function NotificationToggle({
  conversationId,
  enabled,
}: {
  conversationId: string;
  enabled: boolean;
}) {
  return (
    <form action={toggleConversationNotifications.bind(null, conversationId)}>
      <button type="submit" className={`text-xs ${textLinkClass}`}>
        {enabled
          ? "🔔 Notifications email activées pour cette conversation"
          : "🔕 Notifications email désactivées pour cette conversation"}
      </button>
    </form>
  );
}
