import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CaseAnalysis from "@/components/CaseAnalysis";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: CasePageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const resolvedParams = await params;

  return <CaseAnalysis caseId={resolvedParams.id} user={session.user} />;
}
