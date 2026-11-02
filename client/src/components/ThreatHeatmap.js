import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Clock, Flame, Info, Filter, ShieldAlert } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ThreatHeatmap({ scans = [] }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("ALL"); // ALL, HIGH, email, link, message
  const [viewMode, setViewMode] = useState("DAY_OF_WEEK"); // DAY_OF_WEEK or RECENT_DAYS
  const [hoveredCell, setHoveredCell] = useState(null);

  // 1. Process scans into hourly heatmap matrix
  const heatmapData = useMemo(() => {
    // Filter scans by category if selected
    const filteredScans = scans.filter((s) => {
      if (selectedCategory === "ALL") return true;
      if (selectedCategory === "HIGH_RISK") return s.risk === "HIGH";
      if (selectedCategory === "MEDIUM_RISK") return s.risk === "MEDIUM";
      return (s.type || "").toLowerCase() === selectedCategory.toLowerCase();
    });

    if (viewMode === "DAY_OF_WEEK") {
      // 7 days x 24 hours grid
      // Index mapping: 0=Mon, 1=Tue, ..., 6=Sun
      const matrix = Array.from({ length: 7 }, (_, dayIdx) =>
        Array.from({ length: 24 }, (_, hour) => ({
          day: DAYS[dayIdx],
          dayIdx,
          hour,
          count: 0,
          highRisk: 0,
          medRisk: 0,
          lowRisk: 0,
          emailCount: 0,
          linkCount: 0,
          msgCount: 0,
        }))
      );

      // Populate real scan counts
      filteredScans.forEach((scan) => {
        const date = new Date(scan.createdAt || Date.now());
        if (isNaN(date.getTime())) return;

        // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat -> Convert to 0=Mon, ..., 6=Sun
        const jsDay = date.getDay();
        const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
        const hour = date.getHours();

        if (dayIdx >= 0 && dayIdx < 7 && hour >= 0 && hour < 24) {
          const cell = matrix[dayIdx][hour];
          cell.count += 1;
          if (scan.risk === "HIGH") cell.highRisk += 1;
          else if (scan.risk === "MEDIUM") cell.medRisk += 1;
          else cell.lowRisk += 1;

          const t = (scan.type || "").toLowerCase();
          if (t === "email") cell.emailCount += 1;
          else if (t === "link" || t === "url") cell.linkCount += 1;
          else if (t === "message" || t === "sms") cell.msgCount += 1;
        }
      });

      // Flattens into array of cells
      return matrix.flat();
    } else {
      // RECENT 7 DAYS x 24 hours grid
      const today = new Date();
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d);
      }

      const matrix = dates.map((d, dayIdx) => {
        const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const isoDate = d.toISOString().split("T")[0];
        return Array.from({ length: 24 }, (_, hour) => ({
          day: dateStr,
          isoDate,
          dayIdx,
          hour,
          count: 0,
          highRisk: 0,
          medRisk: 0,
          lowRisk: 0,
          emailCount: 0,
          linkCount: 0,
          msgCount: 0,
        }));
      });

      filteredScans.forEach((scan) => {
        const date = new Date(scan.createdAt || Date.now());
        if (isNaN(date.getTime())) return;
        const isoDate = date.toISOString().split("T")[0];
        const hour = date.getHours();

        matrix.forEach((row) => {
          if (row[0].isoDate === isoDate) {
            const cell = row[hour];
            if (cell) {
              cell.count += 1;
              if (scan.risk === "HIGH") cell.highRisk += 1;
              else if (scan.risk === "MEDIUM") cell.medRisk += 1;
              else cell.lowRisk += 1;

              const t = (scan.type || "").toLowerCase();
              if (t === "email") cell.emailCount += 1;
              else if (t === "link" || t === "url") cell.linkCount += 1;
              else if (t === "message" || t === "sms") cell.msgCount += 1;
            }
          }
        });
      });

      return matrix.flat();
    }
  }, [scans, selectedCategory, viewMode]);

  // Compute peak metrics
  const statsSummary = useMemo(() => {
    let maxCell = { count: -1, day: "-", hour: 0 };
    let hourTotals = Array(24).fill(0);
    let dayTotals = {};

    heatmapData.forEach((cell) => {
      if (cell.count > maxCell.count) {
        maxCell = cell;
      }
      hourTotals[cell.hour] += cell.count;
      dayTotals[cell.day] = (dayTotals[cell.day] || 0) + cell.count;
    });

    let peakHour = 0;
    let peakHourCount = -1;
    hourTotals.forEach((cnt, h) => {
      if (cnt > peakHourCount) {
        peakHourCount = cnt;
        peakHour = h;
      }
    });

    let peakDay = "-";
    let peakDayCount = -1;
    Object.entries(dayTotals).forEach(([day, cnt]) => {
      if (cnt > peakDayCount) {
        peakDayCount = cnt;
        peakDay = day;
      }
    });

    const totalEvents = heatmapData.reduce((acc, c) => acc + c.count, 0);

    return {
      peakHourFormatted: `${String(peakHour).padStart(2, "0")}:00 - ${String(
        (peakHour + 1) % 24
      ).padStart(2, "0")}:00`,
      peakHourCount,
      peakDay,
      peakDayCount: Math.max(0, peakDayCount),
      totalEvents,
    };
  }, [heatmapData]);

  // Render D3 Heatmap
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 35, right: 25, bottom: 50, left: 65 };
    const width = containerWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    svg
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Unique Y domain (days or dates)
    const yDomain = Array.from(new Set(heatmapData.map((d) => d.day)));

    // X Scale (24 Hours)
    const xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(HOURS.map(String))
      .padding(0.08);

    // Y Scale (Days)
    const yScale = d3
      .scaleBand()
      .range([0, height])
      .domain(yDomain)
      .padding(0.08);

    const maxCount = d3.max(heatmapData, (d) => d.count) || 1;

    // Custom Security Cyber Color Scale
    // Dark surface -> Indigo -> Cyan -> Amber -> Crimson
    const colorScale = d3
      .scaleLinear()
      .domain([0, 1, Math.max(2, maxCount * 0.4), Math.max(3, maxCount * 0.7), maxCount])
      .range(["#111827", "#1e293b", "#0284c7", "#f59e0b", "#ef4444"]);

    // Render X Axis (Hours)
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => {
        const h = parseInt(d, 10);
        return h % 3 === 0 ? `${String(h).padStart(2, "0")}:00` : "";
      })
      .tickSize(0);

    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    xAxisG.select(".domain").attr("stroke", "var(--border)");
    xAxisG
      .selectAll("text")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "11px")
      .attr("dy", "12px");

    // Render Y Axis (Days)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisG = g.append("g").call(yAxis);

    yAxisG.select(".domain").attr("stroke", "var(--border)");
    yAxisG
      .selectAll("text")
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("dx", "-6px");

    // Render Heatmap Cells
    const cells = g
      .selectAll(".heatmap-cell")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", (d) => xScale(String(d.hour)))
      .attr("y", (d) => yScale(d.day))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => (d.count === 0 ? "#111827" : colorScale(d.count)))
      .attr("stroke", (d) => (d.count === 0 ? "#1e293b" : "none"))
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "transform 0.15s ease, filter 0.15s ease");

    // Add interactivity / hover
    const tooltip = d3.select(tooltipRef.current);

    cells
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#38bdf8")
          .attr("stroke-width", 2)
          .style("filter", "brightness(1.2)");

        setHoveredCell(d);

        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 12}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", d.count === 0 ? "#1e293b" : "none")
          .attr("stroke-width", 1)
          .style("filter", "none");

        setHoveredCell(null);
        tooltip.style("opacity", 0);
      });

    // Color Legend at Bottom
    const legendWidth = 180;
    const legendHeight = 8;
    const legendG = g
      .append("g")
      .attr(
        "transform",
        `translate(${width - legendWidth}, ${height + margin.bottom - 16})`
      );

    // Legend Gradient
    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", "heatmap-legend-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#1e293b" },
        { offset: "35%", color: "#0284c7" },
        { offset: "70%", color: "#f59e0b" },
        { offset: "100%", color: "#ef4444" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    legendG
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 4)
      .attr("fill", "url(#heatmap-legend-grad)");

    legendG
      .append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 12)
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "10px")
      .text("Low / Zero");

    legendG
      .append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 12)
      .attr("text-anchor", "end")
      .attr("fill", "var(--text-muted)")
      .attr("font-size", "10px")
      .text(`High (${maxCount} max)`);

  }, [heatmapData]);

  // Handle Container Resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger effect re-render by updating state or triggering re-mount
      setViewMode((v) => v);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "16px",
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        position: "relative",
        animation: "fadeUp 0.3s ease both",
      }}
    >
      {/* HEADER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(56, 189, 248, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Flame size={16} color="#38bdf8" />
            </div>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Threat Detection Heatmap (Hourly)
            </h3>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            D3-powered visualization of inspection frequency across hours of the day
          </p>
        </div>

        {/* CONTROLS: CATEGORY FILTER & VIEW MODE TOGGLE */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          
          {/* CATEGORY SELECTOR */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={13} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "0.78rem",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Threat Scans</option>
              <option value="HIGH_RISK">High Risk Only</option>
              <option value="MEDIUM_RISK">Medium Risk Only</option>
              <option value="email">Email Phishing</option>
              <option value="link">URL Scans</option>
              <option value="message">SMS / Chat</option>
            </select>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              padding: "3px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setViewMode("DAY_OF_WEEK")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                background: viewMode === "DAY_OF_WEEK" ? "var(--surface-1)" : "transparent",
                color: viewMode === "DAY_OF_WEEK" ? "#38bdf8" : "var(--text-muted)",
                cursor: "pointer",
                boxShadow: viewMode === "DAY_OF_WEEK" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              By Day of Week
            </button>
            <button
              onClick={() => setViewMode("RECENT_DAYS")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                background: viewMode === "RECENT_DAYS" ? "var(--surface-1)" : "transparent",
                color: viewMode === "RECENT_DAYS" ? "#38bdf8" : "var(--text-muted)",
                cursor: "pointer",
                boxShadow: viewMode === "RECENT_DAYS" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              Last 7 Days
            </button>
          </div>

        </div>
      </div>

      {/* METRICS SUMMARY BAR */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "16px",
          padding: "12px 16px",
          background: "var(--surface-2)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Peak Risk Hour
          </span>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={14} />
            {statsSummary.peakHourFormatted}
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Peak Day
          </span>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f59e0b", marginTop: "2px" }}>
            {statsSummary.peakDay} ({statsSummary.peakDayCount} scans)
          </div>
        </div>

        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Visualized Scans
          </span>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
            {statsSummary.totalEvents} events
          </div>
        </div>
      </div>

      {/* SVG CONTAINER FOR D3 */}
      <div ref={containerRef} style={{ width: "100%", overflowX: "auto" }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* TOOLTIP FLOATING DOM OVERLAY */}
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          opacity: 0,
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid #38bdf8",
          borderRadius: "10px",
          padding: "10px 14px",
          color: "#f8fafc",
          fontSize: "0.8rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000,
          transition: "opacity 0.15s ease",
          maxWidth: "220px",
        }}
      >
        {hoveredCell && (
          <div>
            <div style={{ fontWeight: 800, color: "#38bdf8", marginBottom: "4px" }}>
              {hoveredCell.day} @ {String(hoveredCell.hour).padStart(2, "0")}:00 - {String((hoveredCell.hour + 1) % 24).padStart(2, "0")}:00
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
              {hoveredCell.count} Total Scan{hoveredCell.count === 1 ? "" : "s"}
            </div>
            {hoveredCell.count > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span style={{ color: "#f87171" }}>• High Risk: {hoveredCell.highRisk}</span>
                <span style={{ color: "#fbbf24" }}>• Medium Risk: {hoveredCell.medRisk}</span>
                <span style={{ color: "#34d399" }}>• Low / Safe: {hoveredCell.lowRisk}</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
