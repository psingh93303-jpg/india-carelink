import { useEffect, useState } from "react";
import { Star, Loader2, MessageSquarePlus } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type ApprovedReview = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  display_name: string | null;
};

type MyReview = {
  id: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
};

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Pick a rating").max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Keep it under 1000 characters"),
});

export function HospitalReviews({ hospitalId }: { hospitalId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [approved, setApproved] = useState<ApprovedReview[] | null>(null);
  const [mine, setMine] = useState<MyReview | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data: revs } = await supabase
      .from("reviews")
      .select("id,rating,comment,created_at,user_id")
      .eq("hospital_id", hospitalId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);

    const list = revs ?? [];
    const userIds = [...new Set(list.map((r) => r.user_id))];
    let names = new Map<string, string | null>();
    if (userIds.length) {
      const { data: profs } = await supabase.rpc("get_reviewer_names", { _user_ids: userIds });
      names = new Map((profs ?? []).map((p: { user_id: string; display_name: string | null }) => [p.user_id, p.display_name]));
    }
    setApproved(list.map((r) => ({ ...r, display_name: names.get(r.user_id) ?? null })));

    if (user) {
      const { data: my } = await supabase
        .from("reviews")
        .select("id,rating,comment,status")
        .eq("hospital_id", hospitalId)
        .eq("user_id", user.id)
        .maybeSingle();
      setMine((my as MyReview | null) ?? null);
    } else {
      setMine(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId, user?.id]);

  const submit = async () => {
    if (!user) return;
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      hospital_id: hospitalId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review submitted — pending moderation");
    setRating(0);
    setComment("");
    load();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-primary" /> Reviews
        </h2>
      </div>

      {/* Submission area */}
      <div className="mt-4 rounded-xl border border-dashed border-border bg-background/50 p-4">
        {authLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <div className="text-sm text-muted-foreground">
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </div>
        ) : mine ? (
          <div className="text-sm">
            <div className="font-medium">Your review</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-sm font-semibold">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {mine.rating}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Status: {mine.status}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{mine.comment}</p>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">Write a review</div>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      (hover || rating) >= n
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (10–1000 characters)…"
              maxLength={1000}
              className="mt-3"
              rows={4}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{comment.length}/1000</span>
              <Button onClick={submit} disabled={submitting || rating === 0 || comment.trim().length < 10}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit review
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Reviews are moderated before appearing publicly.
            </p>
          </div>
        )}
      </div>

      {/* Approved reviews list */}
      <div className="mt-6 space-y-3">
        {approved === null ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
        ) : (
          approved.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{r.display_name ?? "Anonymous"}</div>
                <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-0.5 text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {r.rating}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{r.comment}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
