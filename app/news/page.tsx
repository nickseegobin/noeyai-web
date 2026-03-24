"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import Spinner from "@/components/ui/Spinner";

interface WPPost { id: number; title: { rendered: string }; excerpt: { rendered: string }; _embedded?: { "wp:featuredmedia"?: { source_url: string }[] }; }

export default function NewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const isParent = !user?.active_child_id;
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => { loadPosts(page); }, [page]);

  async function loadPosts(p: number) {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE?.replace("/wp-json/noey/v1", "") ?? "http://noeyai.local";
      const res = await fetch(`${base}/wp-json/wp/v2/posts?_embed&per_page=10&page=${p}`);
      const data = await res.json();
      const total = Number(res.headers.get("X-WP-TotalPages") ?? 1);
      setPosts(data); setTotalPages(total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function stripHtml(html: string) { return html.replace(/<[^>]*>/g, "").replace(/&hellip;/g, "...").replace(/&#8230;/g, "...").trim(); }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone={isParent ? "parent" : "child"} showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={isParent ? (user?.display_name ?? "") : (activeChild?.display_name ?? "")} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-5">News &amp; Views</h1>
        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : posts.length === 0 ? (
          <p className="text-noey-text-muted text-sm font-medium text-center py-8">No articles yet. Check back soon.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {posts.map(post => {
                const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                return (
                  <button key={post.id} onClick={() => router.push(`/news/${post.id}`)} className="noey-card flex gap-4 items-start text-left hover:bg-noey-surface-dark transition-colors">
                    <div className="w-20 h-20 rounded-2xl flex-shrink-0 bg-noey-surface-dark overflow-hidden">
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-noey-text mb-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      <p className="text-noey-text-muted text-sm font-medium line-clamp-3">{stripHtml(post.excerpt.rendered)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-full font-bold text-sm ${p === page ? "bg-noey-text text-white" : "bg-noey-surface text-noey-text"}`}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
        <BackButton href={isParent ? "/parent/home" : "/child/home"} />
      </div>
    </div>
  );
}
