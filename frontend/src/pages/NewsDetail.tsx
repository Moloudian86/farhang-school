import { Link, useParams } from "react-router-dom";
import { ErrorState, Skeleton } from "../components/ui/States";
import { usePageTitle } from "../hooks/usePageTitle";
import { useNewsDetail } from "../hooks/useApi";
import { formatDate } from "../lib/format";

export default function NewsDetail() {
  const { slug = "" } = useParams();
  const { data: news, isLoading, isError, error } = useNewsDetail(slug);
  usePageTitle(news?.title);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/news" className="text-sm font-bold text-primary hover:underline">بازگشت به اخبار</Link>
      <div className="mt-6">
        {isLoading ? <Skeleton className="h-96" /> : isError ? (
          // A wrong address or an unpublished news item gives 404 from the API: show its message, no retry button.
          <ErrorState message={(error as Error).message} />
        ) : news && (
          <>
            <p className="text-sm text-primary">{news.category.name} - {formatDate(news.publishedAt)}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-snug text-ink md:text-4xl md:leading-snug">{news.title}</h1>
            <p className="mt-2 text-sm text-ink/60">نویسنده: {news.author}</p>
            {news.imageUrl && <img src={news.imageUrl} alt={news.title} className="mt-6 w-full rounded-2xl object-cover" />}
            <p className="mt-6 text-lg leading-9 text-ink/80">{news.summary}</p>
            <div className="mt-4 space-y-5 leading-9 text-ink/80">
              {news.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
