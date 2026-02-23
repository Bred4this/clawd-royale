import { createClient } from "@supabase/supabase-js";

function stripEnv(s: string): string {
  const t = (s ?? "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
    return t.slice(1, -1).trim();
  return t;
}
const supabaseUrl = stripEnv(import.meta.env.VITE_SUPABASE_URL ?? "");
const supabaseAnonKey = stripEnv(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "");

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

const form = document.getElementById("waitlist-form") as HTMLFormElement;
const messageEl = document.getElementById("waitlist-message");

function setMessage(text: string, type: "success" | "error" | "") {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = "waitlist-message " + type;
}

// Dev: run a quick connection test on load
async function devConnectionCheck() {
  if (!import.meta.env.DEV || !messageEl || !supabaseUrl || !supabaseAnonKey) return;
  const urlValid = supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co");
  if (!urlValid) {
    messageEl.textContent = "Dev: VITE_SUPABASE_URL must be https://YOUR_PROJECT.supabase.co (no trailing slash)";
    messageEl.className = "waitlist-message error";
    return;
  }
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/waitlist?select=id&limit=1`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
    });
    if (res.ok || res.status === 406 || res.status === 403) {
      messageEl.textContent = "";
      messageEl.className = "waitlist-message";
      return;
    }
    messageEl.textContent = `Dev: Supabase returned ${res.status}. Check that the waitlist table exists.`;
    messageEl.className = "waitlist-message error";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const hint =
      msg.includes("fetch") || msg.includes("Network")
        ? "Cannot reach Supabase. Check: (1) URL in web/.env matches dashboard (Project Settings → API), (2) Project is not paused."
        : msg;
    messageEl.textContent = `Dev: ${hint}`;
    messageEl.className = "waitlist-message error";
  }
}
if (import.meta.env.DEV && messageEl) {
  if (!supabaseUrl || !supabaseAnonKey) {
    messageEl.textContent = "Dev: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in web/.env, then restart npm run dev.";
    messageEl.className = "waitlist-message error";
  } else {
    devConnectionCheck();
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = form.querySelector<HTMLInputElement>('input[name="email"]');
  const submitBtn = form.querySelector<HTMLButtonElement>("button[type=submit]");
  const email = input?.value?.trim();
  if (!email) return;

  submitBtn?.setAttribute("disabled", "true");
  setMessage("", "");

  const supabase = getSupabase();
  if (!supabase) {
    setMessage("Waitlist is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in web/.env", "error");
    submitBtn?.removeAttribute("disabled");
    return;
  }

  try {
    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      if (error.code === "23505") {
        setMessage("You're already on the list. We'll notify you when we launch.", "success");
      } else {
        setMessage(error.message || "Something went wrong. Try again.", "error");
      }
      submitBtn?.removeAttribute("disabled");
      return;
    }

    setMessage("You're on the list. We'll be in touch.", "success");
    form.reset();
  } catch (err) {
    console.error("Waitlist submit error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch") || msg.includes("Network")) {
      setMessage(
        "Could not reach Supabase. Check: (1) web/.env has correct URL and anon key, (2) run dev from web/ and restart after changing .env, (3) Supabase project not paused (dashboard).",
        "error"
      );
    } else {
      setMessage(msg, "error");
    }
  } finally {
    submitBtn?.removeAttribute("disabled");
  }
});
