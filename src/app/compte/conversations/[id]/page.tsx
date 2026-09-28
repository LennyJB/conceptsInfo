import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach-auth";
import { getCurrentStudent } from "@/lib/student-auth";
import { sendCoachReply, sendStudentReply } from "@/lib/coach-actions";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/MessageThread";
import { NotificationToggle } from "@/components/NotificationToggle";
import { textLinkClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

export default async function ConversationPage(
  props: PageProps<"/compte/conversations/[id]">
) {
  const [coach, student] = await Promise.all([getCurrentCoach(), getCurrentStudent()]);
  if (!coach && !student) redirect("/compte/login");

  const { id } = await props.params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      coach: true,
      student: true,
    },
  });

  if (!conversation) notFound();

  const isCoach = coach && conversation.coachId === coach.id;
  const isStudent = student && conversation.studentId === student.id;
  if (!isCoach && !isStudent) notFound();

  const otherPartyName = isCoach ? conversation.student.name : conversation.coach.name;
  const coachHasReplied = conversation.messages.some((m) => m.sender === "COACH");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/compte" className={textLinkClass}>
        ← Retour à mon compte
      </Link>
      <div className="mt-4 mb-2 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {otherPartyName}
        </h1>
        <NotificationToggle
          conversationId={conversation.id}
          enabled={conversation.notifyByEmail}
        />
      </div>
      {isCoach && (
        <p className="mb-6 text-xs text-zinc-500">{conversation.student.email}</p>
      )}
      {isStudent && coachHasReplied && conversation.coach.phone && (
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Vous pouvez aussi joindre {conversation.coach.name} au{" "}
          <a href={`tel:${conversation.coach.phone}`} className="text-brand hover:text-brand-hover">
            {conversation.coach.phone}
          </a>
          .
        </p>
      )}

      <MessageThread
        messages={conversation.messages}
        viewerRole={isCoach ? "COACH" : "STUDENT"}
        replyAction={
          isCoach
            ? sendCoachReply.bind(null, conversation.id)
            : sendStudentReply.bind(null, conversation.id)
        }
      />
    </main>
  );
}
