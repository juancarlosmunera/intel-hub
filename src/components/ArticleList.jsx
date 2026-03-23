import { useState } from "react";
import Pulse from "./Pulse";
import { timeAgo } from "../utils/classify";
import { SEVERITY_RULES } from "../constants/severity";

export default function ArticleList({ filtered, severityFilter, setSeverityFilter }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <>
      <div style={{
        background: "#0c1220",
        border: "1px solid #111a28",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid #111a28",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 10, color: "#3a4a5e", textTransform: "uppercase", letterSpacing: 1,
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
          <span>{severityFilter ? "Filtered by severity" : "BREACH & CRITICAL pinned to top"}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#2a3a4e", fontSize: 12 }}>
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
                  fontSize: 13, fontWeight: 500, color: "#dce3ea", marginBottom: 4,
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.4,
                }}>
                  {article.title}
                </div>
                <div style={{ fontSize: 11, color: "#4a5a6e", marginBottom: 6, lineHeight: 1.5 }}>
                  {article.cleanDescription.slice(0, 160)}
                  {article.cleanDescription.length > 160 ? "..." : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {article.trust && (
                    <span className="tag" style={{
                      background: `${article.trust.color}15`,
                      color: article.trust.color,
                      border: `1px solid ${article.trust.color}30`,
                      fontWeight: 700, fontSize: 8, letterSpacing: 0.8,
                    }} title={article.trust.description}>
                      {article.trust.label}
                    </span>
                  )}
                  <span className="tag" style={{ background: "#1a2436", color: "#6b7a8d", border: "1px solid #1e2a3a" }}>
                    {article.feedName}
                  </span>
                  <span className="tag" style={{ background: "#5e5ce610", color: "#8e8ce6", border: "1px solid #5e5ce630" }}>
                    {article.feedCategory}
                  </span>
                  {article.redFlags && article.redFlags.length > 0 && (
                    <span className="tag" style={{
                      background: "#ff2d5515", color: "#ff6b8a",
                      border: "1px solid #ff2d5530", fontWeight: 700, fontSize: 8,
                    }} title={`Red flags: ${article.redFlags.join(", ")}`}>
                      FLAGGED ({article.redFlags.length})
                    </span>
                  )}
                  {article.matchedKeywords.slice(0, 4).map((kw, ki) => (
                    <span key={ki} className="keyword-pill">{kw}</span>
                  ))}
                  {article.matchedKeywords.length > 4 && (
                    <span style={{ fontSize: 9, color: "#3a4a5e" }}>+{article.matchedKeywords.length - 4} more</span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 10, color: "#3a4a5e", whiteSpace: "nowrap", paddingTop: 2 }}>
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
                background: "none", border: "none", color: "#4a5a6e",
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
                  background: `${selectedArticle.trust.color}15`,
                  color: selectedArticle.trust.color,
                  border: `1px solid ${selectedArticle.trust.color}30`,
                  fontWeight: 700,
                }}>
                  {selectedArticle.trust.label}
                </span>
              )}
              <span className="tag" style={{ background: "#1a2436", color: "#6b7a8d", border: "1px solid #1e2a3a" }}>
                {selectedArticle.feedName}
              </span>
              <span style={{ fontSize: 11, color: "#3a4a5e" }}>{timeAgo(selectedArticle.pubDate)}</span>
            </div>

            {selectedArticle.redFlags && selectedArticle.redFlags.length > 0 && (
              <div style={{
                padding: "10px 14px", marginBottom: 16, borderRadius: 6,
                background: "#ff2d5510", border: "1px solid #ff2d5530",
              }}>
                <div style={{ fontSize: 10, color: "#ff6b8a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
                  Content Red Flags
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selectedArticle.redFlags.map((flag, i) => (
                    <span key={i} style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 10,
                      background: "#ff2d5520", color: "#ff6b8a", border: "1px solid #ff2d5530",
                    }}>{flag}</span>
                  ))}
                </div>
              </div>
            )}

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 20, fontWeight: 700, color: "#e8edf2",
              lineHeight: 1.3, marginBottom: 16,
            }}>
              {selectedArticle.title}
            </h2>

            <p style={{ fontSize: 13, color: "#8899aa", lineHeight: 1.7, marginBottom: 20 }}>
              {selectedArticle.cleanDescription}
            </p>

            {selectedArticle.matchedKeywords.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#3a4a5e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
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
                background: "#00ff8820", border: "1px solid #00ff8840",
                color: "#00ff88", fontFamily: "inherit", fontSize: 12,
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
