import ResearchAppShell from '@/components/app/research/ResearchAppShell';
import ResearchDetailView from '@/components/app/research/ResearchDetailView';

export default async function ResearchArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ResearchAppShell>
      <ResearchDetailView articleId={id} />
    </ResearchAppShell>
  );
}
