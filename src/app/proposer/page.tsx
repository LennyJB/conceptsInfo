import { redirect } from "next/navigation";

// "Devenir coach" passe désormais par le formulaire d'inscription unifié
// (avec le switch coach/élève) : cette route reste comme alias pour les
// liens existants.
export default function ProposerPage() {
  redirect("/compte/inscription?role=coach");
}
