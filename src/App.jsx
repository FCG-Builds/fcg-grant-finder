import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "small-business", label: "Small Business", icon: "\ud83c\udfea" },
  { id: "nonprofit", label: "Nonprofit", icon: "\ud83e\udd1d" },
  { id: "community-dev", label: "Community Development", icon: "\ud83c\udfe0" },
  { id: "technology", label: "Technology / AI", icon: "\ud83d\udcbb" },
  { id: "education", label: "Education", icon: "\ud83d\udcda" },
  { id: "environment", label: "Environment", icon: "\ud83c\udf3f" },
  { id: "arts-culture", label: "Arts & Culture", icon: "\ud83c\udfa8" },
  { id: "healthcare", label: "Healthcare", icon: "\ud83c\udfe5" },
  { id: "housing", label: "Housing", icon: "\ud83c\udfe0" },
  { id: "agriculture", label: "Agriculture / Food", icon: "\ud83c\udf3e" },
];

const FUNDING_TYPES = [
  { id: "grant", label: "Grants" },
  { id: "loan", label: "Low-Interest Loans" },
  { id: "contract", label: "Government Contracts" },
  { id: "tax-credit", label: "Tax Credits" },
];

const LEVELS = [
  { id: "federal", label: "Federal" },
  { id: "state", label: "State" },
  { id: "municipal", label: "Municipal / Local" },
  { id: "private", label: "Private / Foundation" },
];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function GrantFinder() {
  const [step, setStep] = useState("intake");
  const [category, setCategory] = useState("");
  const [fundingTypes, setFundingTypes] = useState(["grant"]);
  const [levels, setLevels] = useState(["federal", "state"]);
  const [state, setState] = useState("TX");
  const [orgDesc, setOrgDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fcg-gf-saved") || "[]"); } catch { return []; }
  });
  const [showSaved, setShowSaved] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { localStorage.setItem("fcg-gf-saved", JSON.stringify(saved)); }, [saved]);

  const toggle = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);
  const saveGrant = (g) => setSaved(p => p.find(x => x.name === g.name) ? p.filter(x => x.name !== g.name) : [...p, { ...g, savedAt: new Date().toISOString() }]);
  const isSaved = (g) => saved.some(x => x.name === g.name);

  async function search() {
    if (!category || !orgDesc.trim()) { setError("Select a category and describe your organization."); return; }
    setError(""); setLoading(true); setStep("results");
    const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;
    const ftLabels = fundingTypes.map(f => FUNDING_TYPES.find(t => t.id === f)?.label).join(", ");
    const lvLabels = levels.map(l => LEVELS.find(v => v.id === l)?.label).join(", ");

    const prompt = "You are a grant research expert. Find 6-10 real, currently active funding opportunities matching this profile:\n" +
      "Category: " + catLabel + "\n" +
      "Funding types: " + ftLabels + "\n" +
      "Government levels: " + lvLabels + "\n" +
      "State: " + state + "\n" +
      "Organization: " + orgDesc + "\n" +
      (budget ? "Budget: " + budget + "\n" : "") +
      "\nRespond with ONLY a JSON array. Each object: {name, agency, type, level, amount_min, amount_max, deadline, eligibility, description, url, match_score, tips}. Real programs only.";

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
      });
      if (!resp.ok) throw new Error("API error: " + resp.status);
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResults(JSON.parse(clean));
    } catch (e) {
      setError("Search failed: " + e.message);
      setResults([]);
    } finally { setLoading(false); }
  }

  const bg = "#07070d", card = "#0e0e18", border = "#1a1a30", accent = "#a78bfa", muted = "#55556a";
  const chip = (active) => ({ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid " + (active ? accent : border), background: active ? accent + "15" : "transparent", color: active ? accent : "#999" });
  const inp = { padding: "10px 14px", borderRadius: 10, border: "1px solid " + border, background: card, color: "#eeeef2", fontSize: 13, outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "#eeeef2", fontFamily: "system-ui, sans-serif" }}>
      <style>{String.raw`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <header style={{ padding: "16px 28px", borderBottom: "1px solid " + border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg," + accent + ",#6366f1)", display: "grid", placeItems: "center", fontSize: 15 }}>\ud83d\udd0d</div>
          <div><h1 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>FCG Grant Finder</h1><span style={{ fontSize: 11, color: muted }}>AI-powered funding discovery</span></div>
        </div>
        <button onClick={() => setShowSaved(!showSaved)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid " + border, background: "transparent", color: "#aaa", fontSize: 12, cursor: "pointer" }}>Saved ({saved.length})</button>
      </header>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
        {step === "intake" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ textAlign: "center" }}><h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Find Your Funding</h2><p style={{ color: muted, fontSize: 14 }}>Describe your organization and we will find matching grants, loans, and contracts.</p></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>Organization type</label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CATEGORIES.map(c => <button key={c.id} onClick={() => setCategory(c.id)} style={chip(category === c.id)}>{c.icon} {c.label}</button>)}</div></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>Funding types</label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{FUNDING_TYPES.map(f => <button key={f.id} onClick={() => toggle(fundingTypes, setFundingTypes, f.id)} style={chip(fundingTypes.includes(f.id))}>{f.label}</button>)}</div></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>Government level</label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{LEVELS.map(l => <button key={l.id} onClick={() => toggle(levels, setLevels, l.id)} style={chip(levels.includes(l.id))}>{l.label}</button>)}</div></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>State</label><select value={state} onChange={e => setState(e.target.value)} style={{ ...inp, width: 120 }}>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>Describe your organization</label><textarea value={orgDesc} onChange={e => setOrgDesc(e.target.value)} rows={4} placeholder="What does your org do? What project needs funding?" style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 8, display: "block" }}>Funding amount (optional)</label><input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $5,000 - $50,000" style={inp} /></div>
            {error && <div style={{ color: "#f87171", fontSize: 13, padding: "8px 14px", background: "#1a0a0a", borderRadius: 10 }}>{error}</div>}
            <button onClick={search} style={{ padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg," + accent + ",#6366f1)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Find Funding Opportunities</button>
          </div>
        )}
        {step === "results" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{loading ? "Searching..." : results.length + " Opportunities Found"}</h2>
              <button onClick={() => { setStep("intake"); setResults([]); }} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid " + border, background: "transparent", color: "#aaa", fontSize: 12, cursor: "pointer" }}>New Search</button>
            </div>
            {loading && <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ width: 18, height: 18, border: "2px solid #333", borderTop: "2px solid " + accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} /><p style={{ color: muted, fontSize: 13, marginTop: 14 }}>Researching funding sources...</p></div>}
            {results.map((g, i) => (
              <div key={i} onClick={() => setExpandedId(expandedId === i ? null : i)} style={{ background: card, borderRadius: 12, border: "1px solid " + border, marginBottom: 10, cursor: "pointer", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div><div style={{ fontSize: 12, color: muted }}>{g.agency}</div></div>
                  <button onClick={e => { e.stopPropagation(); saveGrant(g); }} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: isSaved(g) ? "#fbbf24" : "#444" }}>{isSaved(g) ? "\u2605" : "\u2606"}</button>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "#6366f118", color: "#818cf8" }}>{g.type}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "#22c55e10", color: "#4ade80" }}>${(g.amount_min||0).toLocaleString()} - ${(g.amount_max||0).toLocaleString()}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "#f5920018", color: "#fbbf24" }}>{g.deadline}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: g.match_score >= 80 ? "#22c55e18" : "#eab30818", color: g.match_score >= 80 ? "#22c55e" : "#eab308" }}>{g.match_score}% match</span>
                </div>
                {expandedId === i && <div style={{ marginTop: 12, borderTop: "1px solid " + border, paddingTop: 12 }}><p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{g.description}</p><div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}><strong>Eligibility:</strong> {g.eligibility}</div><div style={{ fontSize: 12, color: accent, marginTop: 8, padding: "8px 12px", background: accent + "08", borderRadius: 8 }}>Tip: {g.tips}</div>{g.url && <a href={g.url} target="_blank" rel="noopener" style={{ display: "inline-block", marginTop: 10, padding: "8px 20px", borderRadius: 8, background: accent, color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>View Program</a>}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      <footer style={{ padding: "14px 24px", borderTop: "1px solid " + border, textAlign: "center", marginTop: 40 }}><span style={{ fontSize: 10, color: "#333" }}>Built by FCG-builds | Fork and customize for your business</span></footer>
    </div>
  );
}
