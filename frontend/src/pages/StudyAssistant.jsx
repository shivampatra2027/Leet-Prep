import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar.jsx";
import Seo from "@/components/Seo.jsx";
import { studyAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import {
  BookOpen,
  Brain,
  FileUp,
  HelpCircle,
  ListChecks,
  Sparkles,
} from "lucide-react";

const MODES = [
  { id: "ask", label: "Ask", icon: HelpCircle },
  { id: "summarize", label: "Summarize", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: ListChecks },
];

export default function StudyAssistant() {
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ask");
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState(null);

  async function loadMaterials() {
    try {
      const res = await studyAPI.listMaterials();
      setMaterials(res.data?.materials || []);
    } catch {
      setMaterials([]);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    const hasIndexing = materials.some((item) => item.status === "indexing");
    if (!hasIndexing) return undefined;

    const interval = setInterval(() => {
      loadMaterials();
    }, 2000);

    return () => clearInterval(interval);
  }, [materials]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (rawText.trim()) formData.append("text", rawText.trim());
    if (file) formData.append("filename", file.name);

    if (!formData.has("file") && !formData.has("text")) {
      setError("Upload a file or paste study notes.");
      return;
    }

    setUploading(true);
    try {
      await studyAPI.upload(formData);
      setFile(null);
      setRawText("");
      await loadMaterials();
    } catch (err) {
      const status = err.response?.status;
      if (status === 413) {
        setError("Upload failed: file is too large (max 5MB). Please upload a smaller file or paste text.");
      } else {
        setError(err.response?.data?.message || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const confirmed = window.confirm(
      "Delete this material and its embeddings? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    try {
      await studyAPI.deleteMaterial(id);
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!materials.length) return;
    const confirmed = window.confirm(
      "Delete all study materials and embeddings? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingAll(true);
    setError("");
    try {
      await studyAPI.deleteAllMaterials();
      await loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!prompt.trim()) {
      setError("Enter a question or topic first.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === "ask") res = await studyAPI.ask(prompt.trim());
      if (mode === "summarize") res = await studyAPI.summarize(prompt.trim());
      if (mode === "quiz") res = await studyAPI.quiz(prompt.trim(), 5);
      setResult(res.data);
      setQuota(res.data?.quota || null);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
      if (err.response?.data?.quota) setQuota(err.response.data.quota);
    } finally {
      setLoading(false);
    }
  };

  const quizQuestions = result?.quiz?.questions || [];

  return (
    <>
      <Seo
        title="Study Assistant | Leet-Prep"
        description="Upload your notes and use grounded AI for study Q&A, summaries, and quizzes."
        canonical={`${import.meta.env.VITE_SITE_URL || "https://leetcodepremium.xyz"}/study-assistant`}
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
          <section className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              RAG Study Assistant
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Upload notes and study against your own material
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              This uses your uploaded files as retrieval context before Gemini answers.
              Ask doubts, generate summaries, and create quiz questions from your own notes.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-primary" />
                  Upload Study Material
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleUpload} className="space-y-4">
                  <Input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Or paste raw notes / class material here..."
                  />
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Indexing..." : "Upload and Index"}
                  </Button>
                </form>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Indexed materials</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{materials.length}</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deletingAll || materials.length === 0}
                        onClick={handleDeleteAll}
                      >
                        {deletingAll ? "Clearing..." : "Clear all"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {materials.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No study material uploaded yet.
                      </p>
                    )}
                    {materials.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-xl border bg-muted/30 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-foreground">{item.filename}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.chunkCount || 0} chunks</Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={deletingId === item._id}
                              onClick={() => handleDelete(item._id)}
                            >
                              {deletingId === item._id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(item.charCount || 0).toLocaleString()} chars •{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        {item.status === "indexing" && (
                          <p className="mt-1 text-xs text-amber-600">
                            Indexing {item.indexedChunks || 0}/{item.chunkCount || 0} chunks
                          </p>
                        )}
                        {item.status === "failed" && (
                          <p className="mt-1 text-xs text-destructive">
                            Indexing failed. Try re-uploading.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Study Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {MODES.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === mode;
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        onClick={() => setMode(item.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>

                <form onSubmit={handleAction} className="space-y-4">
                  <Textarea
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      mode === "ask"
                        ? "Ask a doubt from your uploaded material..."
                        : mode === "summarize"
                          ? "Enter a topic to summarize..."
                          : "Enter a topic to generate quiz questions..."
                    }
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Thinking..." : `Run ${mode}`}
                  </Button>
                </form>

                {quota && (
                  <p className="text-xs text-muted-foreground">
                    Remaining AI credits: {quota.remainingCredits ?? 0}
                  </p>
                )}

                {result?.cacheHit && (
                  <p className="text-xs text-muted-foreground">Cached result</p>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                {result?.answer && (
                  <div className="rounded-xl border p-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">Answer</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {result.answer}
                    </p>
                  </div>
                )}

                {result?.summary && (
                  <div className="rounded-xl border p-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">Summary</p>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {result.summary}
                    </p>
                  </div>
                )}

                {quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    {quizQuestions.map((item, index) => (
                      <div key={`${item.question}-${index}`} className="rounded-xl border p-4">
                        <p className="font-semibold text-foreground">
                          {index + 1}. {item.question}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {(item.options || []).map((option, optionIndex) => (
                            <li key={`${option}-${optionIndex}`}>
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm text-foreground">
                          Answer: {String.fromCharCode(65 + (item.answerIndex || 0))}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {result?.quiz?.raw && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">Quiz output</p>
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {result.quiz.raw}
                    </pre>
                  </div>
                )}

                {Array.isArray(result?.highlights) && result.highlights.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Highlights</p>
                    {result.highlights.map((item, index) => (
                      <div key={`${item.source}-${index}`} className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">{item.source}</p>
                        <p className="mt-1 text-sm text-foreground">{item.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(result?.sources) && result.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source) => (
                      <Badge key={source} variant="outline">
                        {source}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}