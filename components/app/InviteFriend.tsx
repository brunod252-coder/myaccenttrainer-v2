"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteFriend({ referralCode }: { referralCode: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendEmail: email, friendName: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Could not send the invite.");
        return;
      }
      if (data.devLink) setDevLink(data.devLink);
      setStatus("sent");
      setEmail("");
      setName("");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not send the invite. Please try again.");
    }
  }

  function copyCode() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const link = `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`;
      navigator.clipboard.writeText(link).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        },
        () => {},
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20";

  return (
    <>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-[#a9cfbc] bg-[#f0faf6] px-5 py-4">
        <span className="font-display text-2xl tracking-wide text-[#168c56]">{referralCode}</span>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-lg bg-[#20ad68] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#169357]"
        >
          {copied ? "Link copied ✓" : "Copy link"}
        </button>
      </div>

      <form onSubmit={invite} className="mt-5">
        <p className="text-sm font-semibold text-gray-700">Invite a friend by email</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            type="text"
            placeholder="Friend's name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inputClass}
            type="email"
            required
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send invite"}
          </button>
          {status === "sent" && (
            <span className="text-sm font-medium text-[#2e7d5b]">
              Invite sent ✓{devLink && (<> · <a href={devLink} className="underline">open link (dev)</a></>)}
            </span>
          )}
          {status === "error" && <span className="text-sm font-medium text-[#d1495b]">{message}</span>}
        </div>
      </form>
    </>
  );
}
