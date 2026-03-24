"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import GemBadge from "@/components/ui/GemBadge";
import Spinner from "@/components/ui/Spinner";
import type { LedgerEntry } from "@/types/noey";
import { formatDate } from "@/lib/utils";

interface WCProduct { id: number; name: string; price: string; short_description: string; meta_data: { key: string; value: string }[]; }

export default function AddTokensPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [balRes, ledgerRes] = await Promise.all([api.get("/tokens/balance"), api.get("/tokens/ledger", { params: { limit: 10 } })]);
      setBalance(balRes.data.data.balance);
      setLedger(ledgerRes.data.data.ledger ?? []);
      // WC products — best effort
      const base = process.env.NEXT_PUBLIC_API_BASE?.replace("/wp-json/noey/v1", "") ?? "http://noeyai.local";
      fetch(`${base}/wp-json/wc/v3/products?category=tokens&per_page=10&consumer_key=&consumer_secret=`)
        .then(r => r.ok ? r.json() : []).then(data => setProducts(Array.isArray(data) ? data : [])).catch(() => {});
    } finally { setLoading(false); }
  }

  function getTokenCount(product: WCProduct): string {
    const meta = product.meta_data?.find(m => m.key === "noey_tokens_granted");
    return meta ? `${meta.value} Gems` : product.name;
  }

  function typeLabel(type: LedgerEntry["type"]): string {
    const map: Record<string, string> = { purchase: "Purchase", exam_deduct: "Exam", registration: "Welcome Bonus", monthly_refresh: "Monthly Refresh", admin_credit: "Admin Credit", admin_deduct: "Admin Deduct", refund: "Refund" };
    return map[type] ?? type;
  }

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="parent" showGems showAvatar gemCount={balance} avatarIndex={1} avatarName={user?.display_name ?? ""} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-5">Add Tokens</h1>
        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : (
          <>
            {/* Balance card */}
            <div className="noey-card flex items-center gap-3 mb-2">
              <GemBadge count={balance} />
              <p className="text-noey-text font-bold">gems available</p>
            </div>
            <p className="text-noey-text-muted text-xs font-medium mb-6 ml-1">3 free gems reset on the 1st of every month</p>

            {/* Bundle cards */}
            {products.length > 0 ? (
              <>
                <h2 className="font-black text-lg text-noey-text mb-3">Buy Gems</h2>
                <div className="flex flex-col gap-3 mb-6">
                  {products.map(p => {
                    const base = process.env.NEXT_PUBLIC_API_BASE?.replace("/wp-json/noey/v1", "") ?? "http://noeyai.local";
                    return (
                      <a key={p.id} href={`${base}/cart/?add-to-cart=${p.id}`} target="_blank" rel="noopener noreferrer"
                        className="noey-card flex items-center justify-between hover:bg-noey-surface-dark transition-colors">
                        <div>
                          <p className="font-bold text-base text-noey-text">{getTokenCount(p)}</p>
                          <p className="text-noey-text-muted text-sm font-medium" dangerouslySetInnerHTML={{ __html: p.short_description }} />
                        </div>
                        <div className="text-right">
                          <p className="font-black text-lg text-noey-text">TTD {p.price}</p>
                          <p className="text-noey-text-muted text-xs font-medium">Buy now →</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="noey-card text-center py-6 mb-6">
                <p className="text-noey-text-muted text-sm font-medium">Token packages are managed in WordPress.</p>
                <a href={`${process.env.NEXT_PUBLIC_API_BASE?.replace("/wp-json/noey/v1", "") ?? "http://noeyai.local"}/shop`} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 bg-noey-primary text-white font-bold px-6 py-2.5 rounded-2xl text-sm">Visit Shop →</a>
              </div>
            )}

            {/* Transaction history */}
            <h2 className="font-black text-lg text-noey-text mb-3">Transaction History</h2>
            {ledger.length === 0 ? <p className="text-noey-text-muted text-sm text-center py-4">No purchases yet.</p> : (
              <div className="flex flex-col gap-2">
                {ledger.map(entry => (
                  <div key={entry.ledger_id} className="noey-card flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-noey-text">{typeLabel(entry.type)}</p>
                      <p className="text-noey-text-muted text-xs">{formatDate(entry.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${entry.amount > 0 ? "text-green-600" : "text-noey-gem"}`}>{entry.amount > 0 ? "+" : ""}{entry.amount}</p>
                      <p className="text-noey-text-muted text-xs">Balance: {entry.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <BackButton href="/parent/home" />
      </div>
    </div>
  );
}
