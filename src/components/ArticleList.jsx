import { useState } from "react";
import Pulse from "./Pulse";
import { timeAgo } from "../utils/classify";
import { SEVERITY_RULES } from "../constants/severity";

export default function ArticleList({ filtered, severityFilter, setSeverityFilter, sortMode = "latest" }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <>
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Feed — {filtered.length} items
            {severityFilter && (
              <span
                onClick={() => setSeverityFilter(null)}
                style={{
                  background: `${SEVERITY_RULES.find(r => r.level === severityFilter)?.color || "#fff"}20`,
                  color: SEVERITY_RULES.find(r => r.level === severityFilter)?.color || "#fff",
                  border: `1px solid ${SEVERITY_RULES.find(r => r.level === severityFilter)?.color || "#fff"}40`,
                  padding: "1px 8px", borderRadius: 4, fontSize: 9, fontWeight: 600,
                  cursor: "pointer", letterSpacing: 0.5,
                }}
              >
                {severityFilter} ONLY ×
              </span>
            )}
          </span>
          <span>{severityFilter ? "Filtered by severity" : sortMode === "severity" ? "BREACH & CRITICAL pinned to top" : "Newest first"}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-faint)", fontSize: 12 }}>
            No articles match your current filters.
          </div>
        ) : (
          filtered.slice(0, 100).map((article, i) => (
            <div
              key={`${article.title}-${i}`}
              className="article-row"
              style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
              onClick={() => setSelectedArticle(article)}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 54, paddingTop: 2 }}>
                <Pulse color={article.severity.color} />
                <span className="tag" style={{
                  background: `${article.severity.color}15`,
                  color: article.severity.color,
                  border: `1px solid ${article.severity.color}30`,
                }}>
                  {article.severity.level}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4,
                  lineHeight: 1.4,
                }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.5 }}>
                  {article.cleanDescription.slice(0, 160)}
                  {article.cleanDescription.length > 160 ? "..." : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {article.trust && (
                    <span className="tag" style={{
                      background: `color-mix(in srgb, ${article.trust.color} 15%, transparent)`,
                      color: article.trust.color,
                      border: `1px solid color-mix(in srgb, ${article.trust.color} 30%, transparent)`,
                      fontWeight: 700, fontSize: 8, letterSpacing: 0.8,
                    }} title={article.trust.description}>
                      {article.trust.label}
                    </span>
                  )}
                  <span className="tag" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {article.feedName}
                  </span>
                  <span className="tag" style={{ background: "var(--accent-bg)", color: "var(--text-secondary)", border: "1px solid var(--accent-border)" }}>
                    {article.feedCategory}
                  </span>
                  {article.bias && article.bias.code !== "N" && (
                    <span className="tag" style={{
                      background: `color-mix(in srgb, ${article.bias.color} 15%, transparent)`,
                      color: article.bias.color,
                      border: `1px solid color-mix(in srgb, ${article.bias.color} 30%, transparent)`,
                      fontWeight: 700, fontSize: 8, letterSpacing: 0.8,
                    }} title={`Political leaning: ${article.bias.label}`}>
                      {article.bias.label}
                    </span>
                  )}
                  {article.redFlags && article.redFlags.length > 0 && (
                    <span className="tag" style={{
                      background: "var(--accent-bg)", color: "var(--status-off)",
                      border: "1px solid var(--status-off)", fontWeight: 700, fontSize: 8,
                    }} title={`Red flags: ${article.redFlags.join(", ")}`}>
                      FLAGGED ({article.redFlags.length})
                    </span>
                  )}
                  {article.matchedKeywords.slice(0, 4).map((kw, ki) => (
                    <span key={ki} className="keyword-pill">{kw}</span>
                  ))}
                  {article.matchedKeywords.length > 4 && (
                    <span style={{ fontSize: 9, color: "var(--text-faint)" }}>+{article.matchedKeywords.length - 4} more</span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 10, color: "var(--text-faint)", whiteSpace: "nowrap", paddingTop: 2 }}>
                {timeAgo(article.pubDate)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL OVERLAY */}
      {selectedArticle && (
        <div className="detail-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="detail-panel" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedArticle(null)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none", color: "var(--text-muted)",
                fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}
            >×</button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <Pulse color={selectedArticle.severity.color} />
              <span className="tag" style={{
                background: `${selectedArticle.severity.color}15`,
                color: selectedArticle.severity.color,
                border: `1px solid ${selectedArticle.severity.color}30`,
              }}>
                {selectedArticle.severity.level}
              </span>
              {selectedArticle.trust && (
                <span className="tag" style={{
                  background: `color-mix(in srgb, ${selectedArticle.trust.color} 15%, transparent)`,
                  color: selectedArticle.trust.color,
                  border: `1px solid color-mix(in srgb, ${selectedArticle.trust.color} 30%, transparent)`,
                  fontWeight: 700,
                }}>
                  {selectedArticle.trust.label}
                </span>
              )}
              <span className="tag" style={{ background: "var(--bg-hover)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {selectedArticle.feedName}
              </span>
              {selectedArticle.bias && selectedArticle.bias.code !== "N" && (
                <span className="tag" style={{
                  background: `color-mix(in srgb, ${selectedArticle.bias.color} 15%, transparent)`,
                  color: selectedArticle.bias.color,
                  border: `1px solid color-mix(in srgb, ${selectedArticle.bias.color} 30%, transparent)`,
                  fontWeight: 700,
                }}>
                  {selectedArticle.bias.label}
                </span>
              )}
              <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{timeAgo(selectedArticle.pubDate)}</span>
            </div>

            {selectedArticle.redFlags && selectedArticle.redFlags.length > 0 && (
              <div style={{
                padding: "10px 14px", marginBottom: 16, borderRadius: 6,
                background: "var(--accent-bg)", border: "1px solid var(--status-off)",
              }}>
                <div style={{ fontSize: 10, color: "var(--status-off)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
                  Content Red Flags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedArticle.redFlags.map((flag, i) => (
                    <span key={i} style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 10,
                      background: "var(--accent-bg)", color: "var(--status-off)", border: "1px solid var(--status-off)",
                    }}>{flag}</span>
                  ))}
                </div>
              </div>
            )}

            <h2 style={{
              fontSize: 20, fontWeight: 700, color: "var(--text-primary)",
              lineHeight: 1.3, marginBottom: 16,
            }}>
              {selectedArticle.title}
            </h2>

            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
              {selectedArticle.cleanDescription}
            </p>

            {selectedArticle.matchedKeywords.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Matched Keywords
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedArticle.matchedKeywords.map((kw, i) => (
                    <span key={i} className="keyword-pill">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "10px 20px", borderRadius: 6,
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                color: "var(--accent-strong)", fontFamily: "inherit", fontSize: 12,
                fontWeight: 600, textDecoration: "none", letterSpacing: 0.5,
              }}
            >
              READ FULL ARTICLE →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
