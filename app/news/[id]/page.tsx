"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import Spinner from "@/components/ui/Spinner";

interface WPPost { id: number; title: { rendered: string }; content: { rendered: string }; _embedded?: { "wp:featuredmedia"?: { source_url: string }[] }; }

export default function ArticlePage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const isParent = !user?.active_child_id;
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE?.replace("/wp-json/noey/v1", "") ?? "http://noeyai.local";
    fetch(`${base}/wp-json/wp/v2/posts/${id}?_embed`).then(r => r.json()).then(setPost).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone={isParent ? "parent" : "child"} showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={isParent ? (user?.display_name ?? "") : (activeChild?.display_name ?? "")} />
      <div className="flex-1 px-5 pb-8">
        <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-4">News &amp; Views</p>
        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : !post ? <p className="text-noey-text-muted text-sm">Article not found.</p> : (
          <>
            {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
              <div className="w-full aspect-video rounded-3xl overflow-hidden mb-5 bg-noey-surface-dark">
                <img src={post._embedded["wp:featuredmedia"][0].source_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="font-black text-2xl text-noey-text mb-4" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            <div className="prose prose-sm max-w-none text-noey-text" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
          </>
        )}
        <BackButton href="/news" />
      </div>
    </div>
  );
}
