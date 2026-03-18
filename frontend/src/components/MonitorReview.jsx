/**
 * MonitorReview — Shows the Monitor/Reviewer Agent's evaluation results.
 * Displays quality score, decision, step-by-step reviews, and assessment.
 */
export default function MonitorReview({ executionResults, monitorDecision, monitorFeedback, retryCount }) {
  if (!executionResults) return null

  // Parse quality info from execution results if available
  const stepReviews = executionResults.step_reviews || []
  const qualityScore = executionResults.quality_score

  return (
    <div className="panel" id="monitor-panel">
      <div className="panel__header panel__header--monitor">
        <span className="panel__header-icon">🔍</span>
        <span>Monitor Review</span>
        {retryCount > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.72rem',
            padding: '2px 8px',
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            borderRadius: 'var(--radius-full)',
          }}>
            Retry #{retryCount}
          </span>
        )}
      </div>
      <div className="panel__body">
        <div className="monitor-result">
          {/* Decision & Score */}
          <div className="monitor-result__score">
            {qualityScore && (
              <div>
                <div className="monitor-result__score-value">{qualityScore}/10</div>
                <div className="monitor-result__score-label">Quality Score</div>
              </div>
            )}
            {monitorDecision && (
              <span className={`monitor-result__decision monitor-result__decision--${monitorDecision}`}>
                {monitorDecision === 'approved' ? '✓' : '✗'} {monitorDecision}
              </span>
            )}
          </div>

          {/* Step Reviews */}
          {stepReviews.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Step-by-Step Review:
              </div>
              {stepReviews.map((review, i) => (
                <div key={i} className="monitor-result__step-review">
                  <div className="monitor-result__step-review-header">
                    <span className="monitor-result__step-review-title">
                      Step {review.step_number}: {review.step_title}
                    </span>
                    <span className={`monitor-result__step-status monitor-result__step-status--${review.status}`}>
                      {review.status}
                    </span>
                  </div>
                  <div className="monitor-result__step-comments">{review.comments}</div>
                </div>
              ))}
            </div>
          )}

          {/* Overall Assessment */}
          {executionResults.overall_assessment && (
            <div className="monitor-result__assessment">
              <strong>Assessment:</strong> {executionResults.overall_assessment}
            </div>
          )}

          {/* Feedback (if rejected) */}
          {monitorFeedback && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--color-error)',
            }}>
              <strong>🔄 Feedback for Retry:</strong> {monitorFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
