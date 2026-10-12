import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Search,
  Brain,
  Plus,
  Trash2,
  X,
  Tag,
  CalendarDays,
  FileText,
  Sparkles,
} from "lucide-react";
import "./App.css";

const STORAGE_KEY = "contextkeep.answers.v1";

const starterAnswers = [
  {
    id: "demo-1",
    title: "What is event bubbling?",
    content:
      "Event bubbling means that an event triggered on a child element can propagate upward through its parent elements. For example, clicking a button inside a div can trigger both the button's and the div's click handlers.",
    tags: ["JavaScript", "Web Development"],
    createdAt: "2026-10-12T09:00:00.000Z",
  },
  {
    id: "demo-2",
    title: "Vertical vs horizontal scaling",
    content:
      "Vertical scaling increases the resources of one machine, such as CPU or RAM. Horizontal scaling adds more machines or instances to distribute the workload.",
    tags: ["System Design", "Interview Prep"],
    createdAt: "2026-10-12T09:05:00.000Z",
  },
];

function readAnswers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Could not read ContextKeep answers:", error);
  }

  return starterAnswers;
}

function App() {
  const [answers, setAnswers] = useState(readAnswers);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.error("Could not save ContextKeep answers:", error);
    }
  }, [answers]);

  const filteredAnswers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return answers;

    return answers.filter((answer) => {
      const searchableText = [
        answer.title,
        answer.content,
        ...(answer.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [answers, search]);

  function openNewAnswerForm() {
    setTitle("");
    setContent("");
    setTagsInput("");
    setFormError("");
    setShowForm(true);
  }

  function saveAnswer(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setFormError("Please enter both a title and an answer.");
      return;
    }

    const tags = [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ];

    const newAnswer = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      tags,
      createdAt: new Date().toISOString(),
    };

    setAnswers((current) => [newAnswer, ...current]);
    setShowForm(false);
    setFormError("");
    setSearch("");
  }

  function deleteAnswer(id) {
    const confirmed = window.confirm(
      "Delete this saved answer? This cannot be undone.",
    );

    if (!confirmed) return;

    setAnswers((current) => current.filter((answer) => answer.id !== id));

    if (selectedAnswer?.id === id) {
      setSelectedAnswer(null);
    }
  }

  function resetDemoData() {
    const confirmed = window.confirm(
      "Restore the sample answers? Your current saved answers will be replaced.",
    );

    if (!confirmed) return;

    setAnswers(starterAnswers);
    setSearch("");
    setSelectedAnswer(null);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Saved answer";

    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="ContextKeep home">
          <BookOpen size={25} />
          <span>ContextKeep</span>
        </a>

        <span className="status">Your knowledge, preserved.</span>
      </header>

      <section className="hero" id="home">
        <span className="eyebrow">
          <Sparkles size={14} />
          YOUR PERSONAL AI MEMORY
        </span>

        <h1>Never lose a great answer.</h1>

        <p>Save the explanations you love. Find them whenever you need them.</p>

        <label className="search">
          <Search size={20} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, answers, or tags..."
            aria-label="Search saved answers"
          />

          {search && (
            <button
              className="clear-search"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>
      </section>

      <section className="features">
        <article className="feature">
          <Bookmark size={24} />
          <h2>Answer Vault</h2>
          <p>Keep the exact explanations you want to revisit.</p>
        </article>

        <article className="feature">
          <Search size={24} />
          <h2>Smart Search</h2>
          <p>Find saved material by title, text, or topic tag.</p>
        </article>

        <article className="feature">
          <Brain size={24} />
          <h2>AI Organization</h2>
          <p>Topic classification and semantic search are next.</p>
        </article>
      </section>

      <section className="vault" id="vault">
        <div className="vault-heading">
          <div>
            <span className="eyebrow">YOUR LIBRARY</span>
            <h2>Answer Vault</h2>
            <p>
              {filteredAnswers.length}{" "}
              {filteredAnswers.length === 1 ? "answer" : "answers"}
              {search ? " found" : " saved"}
            </p>
          </div>

          <button className="primary-button" onClick={openNewAnswerForm}>
            <Plus size={18} />
            Save answer
          </button>
        </div>

        {showForm && (
          <form className="answer-form" onSubmit={saveAnswer}>
            <div className="form-heading">
              <h3>Save a new answer</h3>
              <button
                className="icon-button"
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <label>
              Answer title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. How does event bubbling work?"
                maxLength={160}
                required
              />
            </label>

            <label>
              Answer content
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste the explanation you want to keep..."
                rows={7}
                required
              />
            </label>

            <label>
              Tags <span className="muted">(comma-separated)</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="JavaScript, DSA, Interview Prep"
                maxLength={300}
              />
            </label>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="form-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" type="submit">
                <Bookmark size={16} />
                Save to vault
              </button>
            </div>
          </form>
        )}

        {filteredAnswers.length === 0 ? (
          <div className="empty-state">
            <FileText size={34} />
            <h3>{search ? "No matching answers" : "Your vault is empty"}</h3>
            <p>
              {search
                ? "Try another keyword or search for a topic tag."
                : "Save an explanation you love, and it will appear here."}
            </p>

            {search ? (
              <button
                className="secondary-button"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            ) : (
              <button className="primary-button" onClick={openNewAnswerForm}>
                <Plus size={18} />
                Save your first answer
              </button>
            )}
          </div>
        ) : (
          <div className="answer-grid">
            {filteredAnswers.map((answer) => (
              <article className="answer-card" key={answer.id}>
                <div className="answer-card-top">
                  <span className="answer-icon">
                    <Bookmark size={18} />
                  </span>

                  <button
                    className="icon-button delete-button"
                    onClick={() => deleteAnswer(answer.id)}
                    aria-label={`Delete ${answer.title}`}
                    title="Delete answer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <h3>{answer.title}</h3>
                <p className="answer-preview">{answer.content}</p>

                {answer.tags?.length > 0 && (
                  <div className="tag-list">
                    {answer.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="answer-card-footer">
                  <span>
                    <CalendarDays size={14} />
                    {formatDate(answer.createdAt)}
                  </span>

                  <button
                    className="text-button"
                    onClick={() => setSelectedAnswer(answer)}
                  >
                    Read answer →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="vault-tools">
          <button className="text-button" onClick={resetDemoData}>
            Restore sample answers
          </button>
          <span>Stored in this browser</span>
        </div>
      </section>

      {selectedAnswer && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnswer(null);
            }
          }}
        >
          <section
            className="answer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-modal-title"
          >
            <div className="form-heading">
              <span className="eyebrow">SAVED ANSWER</span>
              <button
                className="icon-button"
                onClick={() => setSelectedAnswer(null)}
                aria-label="Close answer"
              >
                <X size={18} />
              </button>
            </div>

            <h2 id="answer-modal-title">{selectedAnswer.title}</h2>

            <p className="modal-date">
              Saved {formatDate(selectedAnswer.createdAt)}
            </p>

            <div className="answer-full-content">{selectedAnswer.content}</div>

            {selectedAnswer.tags?.length > 0 && (
              <div className="tag-list">
                {selectedAnswer.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => setSelectedAnswer(null)}
              >
                Close
              </button>

              <button
                className="danger-button"
                onClick={() => deleteAnswer(selectedAnswer.id)}
              >
                <Trash2 size={16} />
                Delete answer
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
