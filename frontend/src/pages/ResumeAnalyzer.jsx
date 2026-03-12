import { useState } from "react";
import Navbar from "@/components/Navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Upload, Sparkles, FileText, Clock3, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo.jsx";
import { resumeAPI } from "@/lib/api";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [error, setError] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setAnalysis(null);
    setCacheHit(false);

    const formData = new FormData();
    if (resumeText.trim()) formData.append("text", resumeText.trim());
    if (fileBlob) formData.append("resume", fileBlob);

    if (!formData.has("text") && !formData.has("resume")) {
      setError("Please paste resume text or upload a file.");
      return;
    }

    setLoading(true);
    resumeAPI
      .analyze(formData)
      .then((res) => {
        if (res.data?.ok) {
          setAnalysis(res.data);
          setQuotaInfo(res.data?.quota || null);
          setCacheHit(Boolean(res.data?.cacheHit));
        } else {
          setError(res.data?.message || "Analysis failed");
        }
      })
      .catch((err) => {\n        const status = err.response?.status;\n        if (status === 413) {\n          setError("Upload failed: file is too large (max 5MB). Please upload a smaller file or paste text.");\n        } else {\n          setError(err.response?.data?.message || "Analysis failed");\n        }\n        if (err.response?.data?.quota) setQuotaInfo(err.response.data.quota);\n      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Seo
        title="Resume Analyzer | Leet-Prep"
        description="Get a quick, structured review of your resume: ATS hints, strengths, gaps, and quick wins."
        canonical={`${import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz"}/resume-analyzer`}
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Resume Analyzer (beta)
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Get a fast, structured resume review
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Paste your resume text (or upload) to see strengths, gaps, ATS checklist, and quick wins. This demo runs locally and shows a sample analysis.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Paste resume text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                    placeholder="Paste your resume here (Summary, Experience, Projects, Skills)..."
                    className="bg-background"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1">
                      <span className="text-sm text-muted-foreground">
                        Upload resume (PDF/DOCX/TXT)
                      </span>
                      <Input
                        id="resume-file"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFileBlob(file);
                          setFileName(file ? file.name : "");
                        }}
                      />
                      {fileName && (
                        <p className="text-xs text-muted-foreground mt-1">Loaded: {fileName}</p>
                      )}
                    </label>
                    <Button type="submit" disabled={loading || (!resumeText.trim() && !fileName)}>
                      {loading ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {quotaInfo && (
                    <p className="text-xs text-muted-foreground">
                      {quotaInfo.remainingCredits ?? 0} AI credits left today
                      {quotaInfo.nextResetAt ? ` � resets ${new Date(quotaInfo.nextResetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                      {cacheHit ? " � cached result (no credits used)" : ""}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Tip: Paste text for fastest results; PDF/DOCX parsing is supported server-side.
                  </p>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Tips for ATS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Use a single-column layout, no tables.</li>
                    <li>• Save as PDF; keep file size &lt; 1 MB.</li>
                    <li>• Use standard headings: Summary, Experience, Projects, Skills, Education.</li>
                    <li>• Add measurable impact in each bullet.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-primary" />
                    Review checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ 1 page for &lt;7 yrs experience</p>
                  <p>✓ 3–5 bullets per role, each with a metric</p>
                  <p>✓ Tech stack per project/role</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analysis summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{analysis.overview}</p>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">Strengths</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.strengths.map((s) => (
                        <li key={s}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">Gaps</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.gaps.map((s) => (
                        <li key={s}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">ATS score</p>
                    <div className="text-3xl font-bold text-primary">{analysis.score}/100</div>
                    <p className="text-xs text-muted-foreground">Est. alignment with typical JD keywords.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.sections.map((sec) => (
                    <div key={sec.title} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={sec.status === "ok" ? "secondary" : "outline"}>
                          {sec.status === "ok" ? "Good" : "Improve"}
                        </Badge>
                        <p className="font-semibold">{sec.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{sec.tip}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Quick wins (do these first)</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.quickWins.map((q) => (
                      <li key={q} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.aiFeedback && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Card className="border-primary/40">
                      <CardHeader>
                        <CardTitle className="text-base">AI Feedback</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        {analysis.aiFeedback.overallSummary && (
                          <p className="text-foreground">{analysis.aiFeedback.overallSummary}</p>
                        )}
                        {analysis.aiFeedback.keyStrengths && (
                          <div>
                            <p className="font-semibold text-foreground">Strengths</p>
                            <ul className="list-disc list-inside">
                              {analysis.aiFeedback.keyStrengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.aiFeedback.redFlags && (
                          <div>
                            <p className="font-semibold text-foreground">Red flags</p>
                            <ul className="list-disc list-inside">
                              {analysis.aiFeedback.redFlags.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.aiFeedback.missingKeywords && (
                          <div>
                            <p className="font-semibold text-foreground">Missing keywords</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {analysis.aiFeedback.missingKeywords.map((k, i) => (
                                <Badge key={i} variant="secondary">{k}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.aiFeedback.roleFit && (
                          <div className="flex gap-2 flex-wrap text-foreground">
                            {Object.entries(analysis.aiFeedback.roleFit).map(([role, fit]) => (
                              <Badge key={role} variant="outline">
                                {role}: {fit}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {analysis.aiFeedback.priorityFixes && (
                          <div>
                            <p className="font-semibold text-foreground">Priority fixes</p>
                            <ul className="list-disc list-inside">
                              {analysis.aiFeedback.priorityFixes.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.aiFeedback.raw && (
                          <p className="text-xs text-muted-foreground">AI raw: {analysis.aiFeedback.raw}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}


