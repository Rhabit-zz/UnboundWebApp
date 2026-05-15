import React from "react";
import { Button } from "./ui/button.jsx";

export default function QuickCapture({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">Quick Capture</h2>
          <Button type="button" className="bg-white/10 border border-white/20 hover:bg-white/20" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="rounded-3xl border border-purple-800/40 bg-black/40 p-4 text-sm text-purple-200">
          Ready for quick note capture implementation.
        </div>
      </div>
    </div>
  );
}
  const [authed, setAuthed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    principle_related: "general",
    mood: "contemplative",
    is_public: true,
    related_lesson_id: preset.related_lesson_id ?? null,
  });

  useEffect(() => {
    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthed(!!data?.session);
    };
    boot();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    // keyboard: Esc to close
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!authed) return alert("Please sign in first.");
    if (!form.content.trim()) return;

    setSaving(true);
    const { error } = await supabase.from("reflections").insert([form]);
    setSaving(false);
    if (error) return alert(error.message);
    setForm({
      title: "",
      content: "",
      principle_related: "general",
      mood: "contemplative",
      is_public: true,
      related_lesson_id: preset.related_lesson_id ?? null,
    });
    onSaved?.();
    onClose?.();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-200
                    ${isOpen ? "opacity-100" : "opacity-0"} bg-black/50`}
        onClick={onClose}
      />
      {/* drawer (right) */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                    bg-gradient-to-br from-purple-950 to-indigo-950
                    border-l border-purple-700/40 text-white p-5`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Quick Reflection</h3>
          <Button
            className="bg-transparent border border-white/20 hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        {!authed && (
          <div className="mb-3 text-sm text-amber-200">
            You’re not signed in. <a href="/auth" className="underline">Sign in</a> to post.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full rounded-lg bg-black/40 border border-purple-700/50 px-3 py-2"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            disabled={!authed || saving}
          />
          <textarea
            className="w-full h-32 rounded-lg bg-black/40 border border-purple-700/50 px-3 py-2"
            placeholder="Write your thought…"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
            disabled={!authed || saving}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              className="rounded-lg bg-black/40 border border-purple-700/50 px-3 py-2"
              value={form.principle_related}
              onChange={(e) => setForm((f) => ({ ...f, principle_related: e.target.value }))}
              disabled={!authed || saving}
            >
              <option value="general">General</option>
              <option value="mentalism">Mentalism</option>
              <option value="correspondence">Correspondence</option>
              <option value="vibration">Vibration</option>
              <option value="polarity">Polarity</option>
              <option value="rhythm">Rhythm</option>
              <option value="cause_and_effect">Cause and Effect</option>
              <option value="gender">Gender</option>
            </select>

            <select
              className="rounded-lg bg-black/40 border border-purple-700/50 px-3 py-2"
              value={form.mood}
              onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))}
              disabled={!authed || saving}
            >
              <option value="contemplative">Contemplative</option>
              <option value="inspired">Inspired</option>
              <option value="challenged">Challenged</option>
              <option value="enlightened">Enlightened</option>
              <option value="curious">Curious</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-purple-200">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
              disabled={!authed || saving}
            />
            Public
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              className="bg-transparent border border-purple-700/50 hover:bg-purple-800/30"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!authed || saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
