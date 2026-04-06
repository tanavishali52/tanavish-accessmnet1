'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMessageCircle, FiCopy, FiHeart, FiShare2, FiZap } from 'react-icons/fi';
import { apiResearchDetail, type ResearchDetail } from '@/lib/api';
import Skeleton from '@/components/shared/Skeleton';

const CATEGORY_BADGE = 'text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-blue-lt text-blue';

export default function ResearchDetailView({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<ResearchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setArticle(null);
    apiResearchDetail(articleId)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load article');
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const goChatHub = () => router.push('/chathub');

  if (!article && !error) {
    return (
      <div className="flex-1 overflow-y-auto bg-bg px-4 sm:px-6 md:px-8 py-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton width={120} height="1rem" />
          <Skeleton width="90%" height="2rem" />
          <Skeleton width="100%" height="6rem" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex-1 overflow-y-auto bg-bg px-4 sm:px-6 md:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-[0.85rem] text-accent font-medium mb-6 hover:text-accent2"
          >
            <FiArrowLeft size={14} /> Back to Research Feed
          </Link>
          <p className="text-text2 text-[0.9rem]">{error ?? 'Article not found.'}</p>
        </div>
      </div>
    );
  }

  const arxivLink = article.arxivId ? `https://arxiv.org/abs/${article.arxivId}` : null;

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-36">
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-[0.82rem] text-accent font-medium mb-6 hover:text-accent2 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Research Feed
        </Link>

        <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <header className="mb-8">
            <p className="text-[0.8rem] text-text2 mb-2">
              {article.org} · {article.longDate}{' '}
              <span className={`inline-flex align-middle ml-2 ${CATEGORY_BADGE}`}>{article.category}</span>
            </p>
            <h1
              className="font-syne text-[1.35rem] sm:text-[1.75rem] font-bold text-text1 leading-tight mb-3"
              style={{ letterSpacing: '-0.03em' }}
            >
              {article.title}
            </h1>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-text2">{article.authorsLine}</p>
          </header>

          <section className="mb-8">
            <h2 className="text-[0.7rem] font-semibold text-text3 uppercase tracking-widest mb-3">Overview</h2>
            <p className="text-[0.88rem] sm:text-[0.92rem] text-text2 leading-relaxed">{article.overview}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              {article.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl bg-[#FAF8F5] border border-black/[0.06] px-4 py-4 text-center sm:text-left"
                  style={{ borderRadius: 12 }}
                >
                  <div className="font-syne text-xl sm:text-2xl font-bold text-text1">{m.value}</div>
                  <div className="text-[0.72rem] text-text3 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-[0.7rem] font-semibold text-text3 uppercase tracking-widest mb-3">Key findings</h2>
            <ol className="space-y-3 list-none pl-0">
              {article.keyFindings.map((text, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-[#FAF8F5] border border-black/[0.06] px-4 py-3 text-[0.85rem] text-text2 leading-relaxed flex gap-3"
                  style={{ borderRadius: 12 }}
                >
                  <span className="font-syne font-bold text-accent flex-shrink-0 w-6">{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-[0.7rem] font-semibold text-text3 uppercase tracking-widest mb-3">Models referenced</h2>
            <div className="flex flex-wrap gap-2">
              {article.modelsReferenced.map((m) => (
                <span
                  key={m.name}
                  className="inline-flex items-center gap-1.5 text-[0.78rem] font-medium text-text1 bg-white border border-black/[0.08] px-3 py-1.5 rounded-full"
                >
                  <span className="text-base leading-none">{m.icon}</span>
                  {m.name}
                </span>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-[0.7rem] font-semibold text-text3 uppercase tracking-widest mb-3">Impact assessment</h2>
            <div
              className="rounded-xl border border-amber-200/80 bg-amber-lt/60 px-4 py-4 flex gap-3 items-start"
              style={{ borderRadius: 12 }}
            >
              <FiZap className="text-amber mt-0.5 flex-shrink-0" size={18} />
              <p className="text-[0.88rem] text-text2 leading-relaxed">{article.impact}</p>
            </div>
          </section>

          <section className="mb-4">
            <h2 className="text-[0.7rem] font-semibold text-text3 uppercase tracking-widest mb-3">Citation</h2>
            <div className="rounded-xl bg-bg2 border border-black/[0.08] px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
              <p className="text-[0.8rem] text-text2 leading-relaxed flex-1 font-mono">{article.citation}</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(article.citation)}
                className="flex-shrink-0 self-start sm:self-center flex items-center gap-1 text-[0.78rem] font-medium text-accent border border-accent/30 rounded-full px-3 py-1.5 hover:bg-accent-lt transition-colors cursor-pointer bg-white"
              >
                <FiCopy size={12} /> Copy
              </button>
            </div>
            {arxivLink && (
              <a
                href={arxivLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-[0.85rem] text-accent font-medium hover:text-accent2"
              >
                arXiv:{article.arxivId} →
              </a>
            )}
          </section>
        </motion.article>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.08] bg-white/95 backdrop-blur-md px-4 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3 justify-center sm:justify-between">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={goChatHub}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-full bg-[#B45309] hover:bg-[#92400E] text-white text-[0.88rem] font-semibold border-none cursor-pointer shadow-lg font-instrument"
            style={{ maxWidth: 420 }}
          >
            <FiMessageCircle size={18} />
            Discuss in Chat Hub
          </motion.button>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              className="w-11 h-11 rounded-full border border-black/[0.12] bg-white flex items-center justify-center text-text2 hover:bg-bg2 transition-colors cursor-pointer"
              aria-label="Save"
            >
              <FiHeart size={18} />
            </button>
            <button
              type="button"
              className="w-11 h-11 rounded-full border border-black/[0.12] bg-white flex items-center justify-center text-text2 hover:bg-bg2 transition-colors cursor-pointer"
              aria-label="Share"
            >
              <FiShare2 size={18} />
            </button>
          </div>
        </div>
        <div className="sm:hidden flex justify-center gap-3 mt-2">
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-black/[0.12] bg-white flex items-center justify-center text-text2"
            aria-label="Save"
          >
            <FiHeart size={17} />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-black/[0.12] bg-white flex items-center justify-center text-text2"
            aria-label="Share"
          >
            <FiShare2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
