/**
 * HTML Rendering Module for Structured Analysis Results
 */

/**
 * Render structured analysis data into HTML
 * @param {Object} data - Structured analysis data from backend
 * @returns {string} HTML string
 */
export function renderAnalysis(data) {
    if (!data || !data.structured) {
        // Fallback to plain text rendering
        return `<div class="analysis-content">${data.result || 'No results available'}</div>`;
    }

    const structured = data.structured;
    let html = '';

    // Severity badge
    if (structured.severity) {
        const severityClass = `severity-${structured.severity}`;
        const severityIcon = getSeverityIcon(structured.severity);
        html += `<div class="severity-badge ${severityClass}">${severityIcon} ${structured.severity.toUpperCase()}</div>`;
    }

    // Summary section
    if (structured.summary) {
        html += `
            <div class="analysis-section summary-section">
                <h3>📋 Summary</h3>
                <p>${structured.summary}</p>
            </div>
        `;
    }

    // Key findings
    if (structured.key_findings && structured.key_findings.length > 0) {
        html += `
            <div class="analysis-section findings-section">
                <h3>🔍 Key Findings</h3>
                <ul class="findings-list">
                    ${structured.key_findings.map(finding => `<li>${finding}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Detailed sections
    if (structured.sections && structured.sections.length > 0) {
        html += '<div class="analysis-sections">';
        structured.sections.forEach((section, index) => {
            const sectionClass = `section-${section.type || 'info'}`;
            const priorityClass = section.priority ? `priority-${section.priority}` : '';
            const icon = getSectionIcon(section.type);
            
            html += `
                <div class="analysis-section ${sectionClass} ${priorityClass}" data-section="${index}">
                    <div class="section-header">
                        <h4>${icon} ${section.title}</h4>
                        ${section.priority ? `<span class="priority-badge">${section.priority}</span>` : ''}
                    </div>
                    <div class="section-content">
                        ${section.content}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    // Case examples
    if (structured.case_examples && structured.case_examples.length > 0) {
        html += `
            <div class="analysis-section cases-section">
                <h3>📋 Real-World Cases</h3>
                <div class="case-examples">
                    ${structured.case_examples.map(caseEx => `
                        <div class="case-example">
                            <h5>${caseEx.title}</h5>
                            ${caseEx.company ? `<p class="case-company"><strong>Company:</strong> ${caseEx.company}</p>` : ''}
                            <p class="case-description">${caseEx.description}</p>
                            ${caseEx.outcome ? `<p class="case-outcome"><strong>Outcome:</strong> ${caseEx.outcome}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Recommendations
    if (structured.recommendations && structured.recommendations.length > 0) {
        html += `
            <div class="analysis-section recommendations-section">
                <h3>💡 Recommendations</h3>
                <ul class="recommendations-list">
                    ${structured.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    return html;
}

/**
 * Get icon for severity level
 */
function getSeverityIcon(severity) {
    const icons = {
        'low': '✅',
        'medium': '⚠️',
        'high': '🔴',
        'critical': '🚨'
    };
    return icons[severity] || 'ℹ️';
}

/**
 * Get icon for section type
 */
function getSectionIcon(type) {
    const icons = {
        'issue': '⚠️',
        'concern': '⚡',
        'positive': '✅',
        'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

/**
 * Render compact summary for list views
 */
export function renderSummaryCard(data) {
    if (!data || !data.structured) {
        return `<div class="summary-card">${data.result?.substring(0, 200) || 'No summary'}...</div>`;
    }

    const structured = data.structured;
    const severityClass = `severity-${structured.severity || 'low'}`;
    
    return `
        <div class="summary-card ${severityClass}">
            <div class="card-header">
                <span class="severity-indicator">${getSeverityIcon(structured.severity)}</span>
                <span class="agent-name">${data.agent || 'Analysis'}</span>
            </div>
            <p class="card-summary">${structured.summary || 'No summary available'}</p>
            <div class="card-meta">
                ${structured.key_findings ? `<span>${structured.key_findings.length} findings</span>` : ''}
                ${structured.recommendations ? `<span>${structured.recommendations.length} recommendations</span>` : ''}
            </div>
        </div>
    `;
}
