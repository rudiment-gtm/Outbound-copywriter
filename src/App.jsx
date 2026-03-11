import { useState } from "react";
const SYSTEM_PROMPT = `You are Rudiment's outbound email copywriter. You write cold email sequences and LinkedIn messages that have generated real results: 7.14% reply rates, 139 SQLs in 90 days.
You follow these RULES without exception:
- Never use em dashes
- Never use "quick question"
- Never use "I wanted to reach out"
- Never start a Step 2 or Step 3 with "following up" or "wanted to circle back" — lazy openers that signal template
- Never open with "My name is X and I work at Y"
- Never use "touch base", "circle back", "synergy", or "leverage" as a verb
- Never write more than 6 sentences in a cold email body
- Never use bullet points in cold emails
- Never include a calendar link in Step 1
- Never make a claim without a number or name behind it
- Always lead with the prospect's world, not the client's product
- Subject lines are 2-4 words max, never a question, never clickbait
- Step 3 is a breakup email — short (2-3 sentences), never re-pitches
- Step 2 and Step 3 must open with a fresh observation or angle, never "following up" or "wanted to circle back"
FIVE PATTERNS:
Pattern 1 — The Hidden Problem (LABL: 4% reply, 19 opps from 4k emails)
- Open with a problem the prospect has but hasn't quantified yet
- Make it feel inevitable ("most [companies like yours]...")
- Show the specific outcome your client delivers
- Soft CTA: "Can I share how it works?" — not a meeting ask
Pattern 2 — Credibility + Social Proof (Confetti email: 2.75% reply, 7 opps from 2.5k emails)
- Open with earned perspective ("In my time working with [ICP]...")
- Name the pattern you've observed
- Specific social proof — real company type, real result, real numbers
- Meeting ask with optional urgency
Pattern 3 — Creative Hook / Hyper-Personalization (Business Bricks: 7.14% reply, 139 SQLs in 90 days)
- Observe something specific about their company
- State what client does in one sentence
- Describe a personalized creative asset (AI image, custom graphic)
- Ultra-soft CTA: "What do you think?"
- PS: acknowledge the asset is AI-generated, hint the real version is better
- Follow-ups reference the asset — they don't restart the pitch
Pattern 4 — Signal-Based LinkedIn (Confetti LinkedIn: 32.8% message reply)
- The first line MUST reference the exact signal from the campaign description
- If the signal is a job posting, open with: "Hey {{firstName}}, saw your post about hiring for a [exact role from campaign description]."
- If the signal is funding, hiring surge, new office, product launch etc — open by naming it specifically
- State what you do in ALL CAPS or emphasis on the niche
- Disarm ("I hate being sold to" / "no pressure")
- Lowest possible friction ask: a one-pager, a resource
- Do NOT write generic signal copy — the campaign description contains the specific trigger, use it
Pattern 5 — Value Prop Forward (Workstream: 5% reply, 31 opps from 3,180 emails)
- Open with their messy operational reality in one sentence
- Deliver the full value prop in one tight paragraph: what it is, who it's built for, what it replaces, proof at scale
- Step 2: pivot to the emotional win (time back, less firefighting) — not a feature repeat
- Step 3: reframe as a peer observation, name the social proof again, soft meeting ask
SEQUENCE STRUCTURE:
- Step 1 (Day 0): Hook + soft CTA, 4-6 sentences, subject line 2-4 words
- Step 2 (Day 2-3): Different angle, more direct meeting ask, 4-6 sentences. MUST NOT open with "following up" or "wanted to circle back"
- Step 3 (Day 5-7): Breakup email, 2-3 sentences only, never re-pitches. MUST NOT open with "following up" or "wanted to circle back"
OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no commentary:
{
  "pattern_used": "Pattern name and number",
  "subject_line": "2-4 word subject",
  "steps": [
    { "step": 1, "send_day": 0, "body": "Full email body" },
    { "step": 2, "send_day": 3, "body": "Full email body" },
    { "step": 3, "send_day": 6, "body": "Full email body" }
  ],
  "why_it_works": "2-3 sentences explaining which pattern was used and what makes it effective for this ICP",
  "clay_variables": ["List of every {{variable}} used and what enrichment column feeds it"]
}`;
const PATTERNS = [
  { id: "auto", label: "Auto-select", desc: "Let the AI pick the best pattern" },
  { id: "1", label: "Hidden Problem", desc: "4% reply — problem they haven't quantified" },
  { id: "2", label: "Credibility + Social Proof", desc: "2.75% reply — earned perspective + specific proof" },
  { id: "3", label: "Creative Hook", desc: "7.14% reply — hyper-personalized asset" },
  { id: "4", label: "Signal-Based LinkedIn", desc: "32.8% reply — trigger-based outreach" },
  { id: "5", label: "Value Prop Forward", desc: "5% reply — full scope, proof at scale" },
];
const CAMPAIGN_PLACEHOLDER = {
  auto: "e.g. Targeting ops leaders at QSR franchises running on manual processes",
  "1": "e.g. Targeting ecommerce brands who don't know they're overpaying on shipping",
  "2": "e.g. Targeting agency owners scaling headcount without breaking margin",
  "3": "e.g. Targeting marketing directors at mid-market B2B SaaS companies",
  "4": "e.g. They posted on LinkedIn hiring for a Senior Sales Engineer — include that exact role title so it leads the first line",
  "5": "e.g. Targeting multi-location operators juggling 5+ tools for HR and payroll",
};
const C = {
  accent: "#00ffb3",
  accentDim: "rgba(0,255,179,0.1)",
  accentAlert: "rgba(0,255,179,0.05)",
  bg: "#0a0f0d",
  surface: "#0e1411",
  border: "#182820",
  textMain: "#c8e8d8",
  textMuted: "#4e7060",
  textDim: "#2a4838",
  redDim: "rgba(255,68,68,0.1)",
};
export default function App() {
  const [form, setForm] = useState({
    clientName: "",
    whatTheySell: "",
    valueProp: "",
    icpTitle: "",
    icpCompanyType: "",
    companySize: "",
    primaryPain: "",
    socialProof: "",
    campaignDescription: "",
    pattern: "auto",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copiedStep, setCopiedStep] = useState(null);
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  };
  const isSignal = form.pattern === "4";
  const buildUserPrompt = () => {
    const patternInstruction = form.pattern === "auto"
      ? "Choose the best pattern based on the information provided."
      : `Use Pattern ${form.pattern} for this sequence.`;
    const signalNote = isSignal
      ? `\nSIGNAL CONTEXT (Pattern 4): The campaign description contains the exact trigger. The first line of Step 1 MUST reference it specifically. If it mentions a job role, open with "Hey {{firstName}}, saw your post about hiring for a [exact role]." Do not genericize it.`
      : "";
    return `Write a 3-step outbound email sequence for this client.
Client: ${form.clientName}
What they sell: ${form.whatTheySell}
Value proposition: ${form.valueProp || "Not provided — infer from what they sell"}
ICP title: ${form.icpTitle}
ICP company type: ${form.icpCompanyType}
Company size: ${form.companySize || "Not specified"}
Primary pain / trigger: ${form.primaryPain}
Social proof / results: ${form.socialProof || "None provided — use a believable outcome placeholder"}
Campaign description: ${form.campaignDescription || "Not provided"}
${signalNote}
${patternInstruction}
CRITICAL: Step 2 and Step 3 must NOT open with "following up", "wanted to circle back", or any variation. Open each follow-up with a fresh angle.
Use {{firstName}} and {{company}} as the minimum personalization variables. Add others if the pattern calls for it. Ensure every variable has a note about fallback behavior.`;
  };
  const generate = async () => {
    if (!form.clientName || !form.whatTheySell || !form.icpTitle || !form.primaryPain) {
      setError("Fill in Client, What They Sell, ICP Title, and Primary Pain to generate.");
      return;
    }
    if (isSignal && !form.campaignDescription) {
      setError("Signal-Based requires a Campaign Description — describe the exact trigger (e.g. the job role they posted).");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt() }],
        }),
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong generating the sequence. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const copyStep = (text, stepNum) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 1800);
  };
  const copyAll = () => {
    if (!result) return;
    const full = [
      `Subject: ${result.subject_line}`,
      "",
      ...result.steps.map(s => `--- Step ${s.step} (Send Day ${s.send_day}) ---\n${s.body}`),
      "",
      `Pattern: ${result.pattern_used}`,
      `Why it works: ${result.why_it_works}`,
    ].join("\n");
    navigator.clipboard.writeText(full);
    setCopiedStep("all");
    setTimeout(() => setCopiedStep(null), 1800);
  };
  const inp = {
    width: "100%",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: C.textMain,
    fontSize: 13,
    outline: "none",
    fontFamily: "system-ui, -apple-system, sans-serif",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
  const sectionCard = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 22,
    marginBottom: 14,
  };
  const sectionHeader = (num, title) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: C.accentDim, border: `1px solid ${C.accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, color: C.accent, flexShrink: 0,
      }}>{num}</div>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase" }}>
        {title}
      </span>
    </div>
  );
  const lbl = (text, optional = false) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: C.textMain, marginBottom: optional ? 2 : 6, textTransform: "uppercase" }}>
      {text}{optional && <span style={{ color: C.textMuted, fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>(optional)</span>}
    </label>
  );
  const sublbl = (text, highlight = false) => (
    <span style={{ display: "block", fontSize: 11, marginBottom: 7, fontStyle: "italic", color: highlight ? C.accent : C.textMuted }}>
      {text}
    </span>
  );
  const resultsPanel = result && (
    <div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Pattern</div>
          <div style={{ fontSize: 13, color: C.textMain }}>{result.pattern_used}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Subject Line</div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>{result.subject_line}</div>
        </div>
      </div>
      {result.steps.map((step) => (
        <div key={step.step} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ background: "#0c1310", borderBottom: `1px solid ${C.border}`, padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 19, height: 19, borderRadius: "50%", background: C.accentDim, border: `1px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent }}>
                {step.step}
              </div>
              <span style={{ fontSize: 10, letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase" }}>
                Step {step.step} — Send Day {step.send_day}
              </span>
            </div>
            <button onClick={() => copyStep(step.body, step.step)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              color: copiedStep === step.step ? C.accent : C.textDim,
              fontFamily: "system-ui, sans-serif", transition: "color 0.2s", padding: "4px 6px",
            }}>
              {copiedStep === step.step ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <div style={{ padding: 18, fontSize: 13, lineHeight: 1.85, color: "#9ec8b0", whiteSpace: "pre-wrap" }}>
            {step.body}
          </div>
        </div>
      ))}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 10px 10px 0", padding: "13px 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", marginBottom: 6 }}>Why This Works</div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: C.textMuted, margin: 0 }}>{result.why_it_works}</p>
      </div>
      {result.clay_variables?.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Clay Variables</div>
          {result.clay_variables.map((v, i) => (
            <div key={i} style={{ fontSize: 12, color: C.textDim, fontFamily: "monospace", marginBottom: 3 }}>{v}</div>
          ))}
        </div>
      )}
      <button onClick={copyAll} style={{
        width: "100%", padding: "12px", borderRadius: 10,
        border: `1px solid ${copiedStep === "all" ? C.accent : C.border}`,
        background: "transparent",
        color: copiedStep === "all" ? C.accent : C.textMuted,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
        cursor: "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s",
      }}>
        {copiedStep === "all" ? "Copied to clipboard ✓" : "Copy full sequence"}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textMain, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${C.textDim}; }
        input:focus, textarea:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentDim}; }
        textarea { resize: none; }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{
        maxWidth: result ? 1080 : 480,
        margin: "0 auto",
        padding: "40px 24px 80px",
        display: result ? "grid" : "block",
        gridTemplateColumns: result ? "460px 1fr" : undefined,
        gap: result ? 32 : undefined,
        alignItems: "start",
        transition: "max-width 0.2s",
      }}>
        <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, color: C.accent, margin: "0 0 10px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Outbound copywriter
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Cold email sequences built from proven patterns. 7.14% reply rates. No fluff.
          </p>
        </div>
        {/* Section 1 — Client + ICP */}
        <div style={sectionCard}>
          {sectionHeader(1, "Client + ICP")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              {lbl("Client Name")}
              <input style={inp} placeholder="e.g. Workstream" value={form.clientName} onChange={e => handleChange("clientName", e.target.value)} />
            </div>
            <div>
              {lbl("What They Sell")}
              <input style={inp} placeholder="e.g. HR + payroll for hourly teams" value={form.whatTheySell} onChange={e => handleChange("whatTheySell", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            {lbl("Value Proposition")}
            {sublbl("What makes it different. What it replaces. The core promise with proof.")}
            <textarea style={{ ...inp, minHeight: 78 }} rows={3}
              placeholder="e.g. All-in-one platform replacing 7+ tools, 30,000+ locations trust it including Jimmy John's and Culver's."
              value={form.valueProp} onChange={e => handleChange("valueProp", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              {lbl("ICP Job Title")}
              <input style={inp} placeholder="e.g. VP Ops, General Manager" value={form.icpTitle} onChange={e => handleChange("icpTitle", e.target.value)} />
            </div>
            <div>
              {lbl("ICP Company Type")}
              <input style={inp} placeholder="e.g. Multi-location QSR franchise" value={form.icpCompanyType} onChange={e => handleChange("icpCompanyType", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            {lbl("Company Size")}
            <input style={inp} placeholder="e.g. 50-500 employees, 10+ locations" value={form.companySize} onChange={e => handleChange("companySize", e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            {lbl("Primary Pain / Trigger")}
            <textarea style={{ ...inp, minHeight: 68 }} rows={2}
              placeholder="e.g. Juggling multiple systems, chasing paperwork, compliance headaches"
              value={form.primaryPain} onChange={e => handleChange("primaryPain", e.target.value)} />
          </div>
          <div>
            {lbl("Social Proof / Results", true)}
            <textarea style={{ ...inp, minHeight: 68 }} rows={2}
              placeholder="e.g. Cut admin time 60%, eliminated 7 tools, saved $40K/yr"
              value={form.socialProof} onChange={e => handleChange("socialProof", e.target.value)} />
          </div>
        </div>
        {/* Section 2 — Copy Pattern */}
        <div style={sectionCard}>
          {sectionHeader(2, "Copy Pattern")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PATTERNS.map(p => {
              const active = form.pattern === p.id;
              return (
                <button key={p.id} onClick={() => handleChange("pattern", p.id)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10, textAlign: "left",
                  border: `1px solid ${active ? C.accent : C.border}`,
                  background: active ? C.accentDim : "transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: active ? C.accent : C.textDim,
                    boxShadow: active ? `0 0 8px ${C.accent}` : "none",
                    transition: "all 0.15s",
                  }} />
                  <div>
                    <span style={{ fontSize: 13, color: active ? C.accent : C.textMain, fontWeight: active ? 500 : 400 }}>{p.label}</span>
                    <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8 }}>{p.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Section 3 — Campaign Description */}
        <div style={{
          ...sectionCard,
          border: isSignal ? `1px solid rgba(0,255,179,0.3)` : `1px solid ${C.border}`,
          background: isSignal ? C.accentAlert : C.surface,
          transition: "all 0.2s",
        }}>
          {sectionHeader(3, "Campaign Description")}
          {isSignal && (
            <div style={{
              background: C.accentDim,
              border: `1px solid rgba(0,255,179,0.2)`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 12,
              fontSize: 12,
              color: C.accent,
              lineHeight: 1.6,
            }}>
              Signal-Based selected. Describe the exact trigger — job role, funding round, or event. The first line will reference it directly.
            </div>
          )}
          {lbl("Campaign Description", !isSignal)}
          {sublbl(
            isSignal
              ? "e.g. They posted on LinkedIn hiring for a Senior Sales Engineer — include the exact role title"
              : CAMPAIGN_PLACEHOLDER[form.pattern],
            isSignal
          )}
          <textarea
            style={{
              ...inp,
              minHeight: 80,
              borderColor: isSignal && !form.campaignDescription ? "rgba(0,255,179,0.25)" : C.border,
            }}
            rows={3}
            placeholder={CAMPAIGN_PLACEHOLDER[form.pattern]}
            value={form.campaignDescription}
            onChange={e => handleChange("campaignDescription", e.target.value)}
          />
        </div>
        {error && (
          <div style={{ background: C.redDim, border: `1px solid rgba(255,68,68,0.25)`, borderRadius: 10, padding: "11px 14px", marginBottom: 14, fontSize: 13, color: "#ff8888" }}>
            {error}
          </div>
        )}
        {/* Generate */}
        <button onClick={generate} disabled={loading} style={{
          width: "100%", padding: "15px", borderRadius: 12, border: "none",
          background: loading ? C.surface : C.accent,
          color: loading ? C.textMuted : "#060e0a",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "system-ui, -apple-system, sans-serif",
          transition: "all 0.2s",
          boxShadow: loading ? "none" : `0 0 28px rgba(0,255,179,0.22)`,
        }}>
          {loading ? "Writing sequence..." : "Generate Sequence"}
        </button>
        <div style={{ marginTop: 48, textAlign: "center", fontSize: 10, letterSpacing: "0.15em", color: C.textDim, textTransform: "uppercase" }}>
          Rudiment GTM Engineering
        </div>
        </div>
        {resultsPanel}
      </div>
    </div>
  );
}
