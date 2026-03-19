import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import './PlanFlowchart.css';

// Initialize mermaid with our neon matrix theme!
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: 'rgba(0, 0, 0, 0.4)',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#39ff14',
    lineColor: '#6b7280',
    secondaryColor: '#111827',
    tertiaryColor: '#1f2937',
    edgeLabelBackground: 'rgba(0,0,0,0.8)',
    fontFamily: '"Geist Mono", "Inter", sans-serif',
  }
});

export default function PlanFlowchart({ plan }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!plan || !plan.steps || plan.steps.length === 0) return;

    // Generate Mermaid diagram syntax based on the LLM's dynamic steps
    let graphDef = 'graph TD\n';
    
    // Create base nodes
    plan.steps.forEach(step => {
      // Escape quotes in titles to prevent mermaid syntax errors
      const safeTitle = step.title.replace(/"/g, "'");
      graphDef += `  Step${step.step_number}["${step.step_number}. ${safeTitle}"]\n`;
      // add style specific to nodes making them pop
      graphDef += `  style Step${step.step_number} rx:8,ry:8\n`;
    });

    // Create directed edges for dependencies
    plan.steps.forEach(step => {
      if (step.depends_on && step.depends_on.length > 0) {
        step.depends_on.forEach(dep => {
          graphDef += `  Step${dep} --> Step${step.step_number}\n`;
        });
      } else if (step.step_number > 1) {
        // Backup: if the LLM forgot to list dependencies but sequential flow makes sense
        graphDef += `  Step${step.step_number - 1} -.-> Step${step.step_number}\n`;
      }
    });

    // Async render call
    const renderChart = async () => {
      try {
        // Clear previous contents
        if (chartRef.current) chartRef.current.innerHTML = '';
        
        // mermaid.render returns an object with `svg` string
        const { svg } = await mermaid.render(`mermaid-chart-${Date.now()}`, graphDef);
        if (chartRef.current) chartRef.current.innerHTML = svg;
      } catch (error) {
        console.error("Mermaid generation failed:", error);
      }
    };

    renderChart();

  }, [plan]);

  if (!plan || !plan.steps || plan.steps.length === 0) return null;

  return (
    <div className="plan-flowchart">
      <div className="plan-flowchart__header">
        <span className="icon">🗺️</span>
        <span>AI Generated Plan Hierarchy</span>
        <span className="count">{plan.steps.length} Steps</span>
      </div>
      <div className="plan-flowchart__body">
         <div ref={chartRef} className="mermaid-container"></div>
      </div>
    </div>
  );
}
