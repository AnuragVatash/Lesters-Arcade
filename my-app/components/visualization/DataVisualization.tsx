"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Data Visualization Components for Lester's Arcade
// This file contains various data visualization components for analytics and monitoring

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface LineChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

export interface BarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

export interface PieChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

export interface RadarChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  className?: string;
}

export interface HeatmapProps {
  data: number[][];
  labels: string[];
  width?: number;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

export interface GaugeProps {
  value: number;
  max: number;
  width?: number;
  height?: number;
  label?: string;
  unit?: string;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

export interface ProgressRingProps {
  value: number;
  max: number;
  width?: number;
  height?: number;
  label?: string;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  // animated is currently not used
  animated?: boolean;
  className?: string;
}

// Line Chart Component
export function LineChart({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showLabels = true,
  className,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // removed unused animationRef

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, width, height);

    if (data.datasets.length === 0) return;

    // Find min and max values
    const allValues = data.datasets.flatMap((dataset) => dataset.data);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= data.labels.length; i++) {
        const x = padding + (chartWidth / data.labels.length) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    }

    // Draw datasets
    data.datasets.forEach((dataset) => {
      ctx.strokeStyle = (dataset.borderColor as string) || "#00FF41";
      ctx.lineWidth = 2;
      ctx.fillStyle =
        (dataset.backgroundColor as string) || "rgba(0, 255, 65, 0.1)";

      ctx.beginPath();

      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1)) * index;
        const y =
          height - padding - ((value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Fill area under line
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      ctx.fill();
    });

    // Draw labels
    if (showLabels) {
      ctx.fillStyle = "#00FF41";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";

      data.labels.forEach((label, index) => {
        const x = padding + (chartWidth / (data.labels.length - 1)) * index;
        ctx.fillText(label, x, height - padding + 20);
      });
    }
  }, [data, width, height, showGrid, showLabels]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Bar Chart Component
export function BarChart({
  data,
  width = 400,
  height = 200,
  showValues = true,
  className,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.datasets.length === 0) return;

    // Find max value
    const allValues = data.datasets.flatMap((dataset) => dataset.data);
    const maxValue = Math.max(...allValues);

    const barWidth = chartWidth / data.labels.length / data.datasets.length;
    const barSpacing = barWidth * 0.2;

    data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x =
          padding +
          index * (chartWidth / data.labels.length) +
          datasetIndex * barWidth +
          barSpacing;
        const y = height - padding - barHeight;

        // Draw bar
        ctx.fillStyle = (dataset.backgroundColor as string) || "#00FF41";
        ctx.fillRect(x, y, barWidth - barSpacing, barHeight);

        // Draw border
        ctx.strokeStyle = (dataset.borderColor as string) || "#00FF41";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth - barSpacing, barHeight);

        // Draw value
        if (showValues) {
          ctx.fillStyle = "#00FF41";
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        }
      });
    });

    // Draw labels
    ctx.fillStyle = "#00FF41";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";

    data.labels.forEach((label, index) => {
      const x =
        padding +
        index * (chartWidth / data.labels.length) +
        chartWidth / data.labels.length / 2;
      ctx.fillText(label, x, height - padding + 20);
    });
  }, [data, width, height, showValues]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Pie Chart Component
export function PieChart({
  data,
  width = 300,
  height = 300,
  showLegend = true,
  showPercentages = true,
  className,
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.datasets.length === 0) return;

    const dataset = data.datasets[0];
    const total = dataset.data.reduce((sum, value) => sum + value, 0);

    let currentAngle = 0;

    dataset.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = Array.isArray(dataset.backgroundColor)
        ? dataset.backgroundColor[index]
        : dataset.backgroundColor || "#00FF41";

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw percentage
      if (showPercentages) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);
      }

      currentAngle += sliceAngle;
    });

    // Draw legend
    if (showLegend) {
      let legendY = 20;
      dataset.data.forEach((value, index) => {
        const color = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.backgroundColor || "#00FF41";

        ctx.fillStyle = color;
        ctx.fillRect(10, legendY, 15, 15);

        ctx.fillStyle = "#00FF41";
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        ctx.fillText(data.labels[index], 30, legendY + 12);

        legendY += 20;
      });
    }
  }, [data, width, height, showLegend, showPercentages]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Gauge Component
export function Gauge({
  value,
  max,
  width = 200,
  height = 200,
  label = "",
  unit = "",
  className,
}: GaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGauge = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw value arc
    const percentage = value / max;
    const endAngle = Math.PI + percentage * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle);
    ctx.strokeStyle = "#00FF41";
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw value text
    ctx.fillStyle = "#00FF41";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(value.toString(), centerX, centerY - 10);

    if (unit) {
      ctx.font = "14px monospace";
      ctx.fillText(unit, centerX, centerY + 15);
    }

    if (label) {
      ctx.font = "12px monospace";
      ctx.fillText(label, centerX, centerY + 35);
    }
  }, [value, max, width, height, label, unit]);

  useEffect(() => {
    drawGauge();
  }, [drawGauge]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Progress Ring Component
export function ProgressRing({
  value,
  max,
  width = 100,
  height = 100,
  label = "",
  className,
}: ProgressRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawRing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw progress ring
    const percentage = value / max;
    const endAngle = percentage * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + endAngle);
    ctx.strokeStyle = "#00FF41";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Draw percentage text
    ctx.fillStyle = "#00FF41";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(percentage * 100)}%`, centerX, centerY + 5);

    if (label) {
      ctx.font = "10px monospace";
      ctx.fillText(label, centerX, centerY + 20);
    }
  }, [value, max, width, height, label]);

  useEffect(() => {
    drawRing();
  }, [drawRing]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Sparkline Component
export function Sparkline({
  data,
  width = 200,
  height = 50,
  color = "#00FF41",
  className,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSparkline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    if (data.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue || 1;

    const stepX = width / (data.length - 1);
    const padding = 5;

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = index * stepX;
      const y =
        height -
        padding -
        ((value - minValue) / valueRange) * (height - padding * 2);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw area fill
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = color + "20";
    ctx.fill();
  }, [data, width, height, color]);

  useEffect(() => {
    drawSparkline();
  }, [drawSparkline]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Heatmap Component
export function Heatmap({
  data,
  labels,
  width = 400,
  height = 300,
  showValues = true,
  className,
}: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    if (data.length === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const cellWidth = width / data[0].length;
    const cellHeight = height / data.length;

    // Find min and max values
    const allValues = data.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue || 1;

    // Draw cells
    data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = colIndex * cellWidth;
        const y = rowIndex * cellHeight;

        // Calculate color intensity
        const intensity = (value - minValue) / valueRange;
        const hue = 120 - intensity * 60; // Green to yellow
        const saturation = 100;
        const lightness = 50 + intensity * 30;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Draw border
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Draw value
        if (showValues) {
          ctx.fillStyle = intensity > 0.5 ? "#000000" : "#FFFFFF";
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(
            value.toString(),
            x + cellWidth / 2,
            y + cellHeight / 2 + 3
          );
        }
      });
    });

    // Draw labels
    ctx.fillStyle = "#00FF41";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";

    labels.forEach((label, index) => {
      const x = index * cellWidth + cellWidth / 2;
      ctx.fillText(label, x, height - 5);
    });
  }, [data, labels, width, height, showValues]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("border border-green-500/30 rounded", className)}
      style={{ width, height }}
    />
  );
}

// Dashboard Component
export function VisualizationDashboard({ className }: { className?: string }) {
  // stats are currently unused in this demo dashboard

  // Sample data for demonstration
  const lineChartData: ChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Games Played",
        data: [12, 19, 3, 5, 2, 3, 8],
        backgroundColor: "rgba(0, 255, 65, 0.1)",
        borderColor: "#00FF41",
        borderWidth: 2,
      },
    ],
  };

  const barChartData: ChartData = {
    labels: ["Casino", "Cayo", "Number"],
    datasets: [
      {
        label: "Wins",
        data: [15, 12, 8],
        backgroundColor: ["#00FF41", "#00CC33", "#00AA22"],
        borderColor: ["#00FF41", "#00CC33", "#00AA22"],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData: ChartData = {
    labels: ["Wins", "Losses", "Incomplete"],
    datasets: [
      {
        label: "Game Results",
        data: [35, 10, 5],
        backgroundColor: ["#00FF41", "#FF4444", "#FFAA00"],
        borderColor: ["#00FF41", "#FF4444", "#FFAA00"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6",
        className
      )}
    >
      {/* Line Chart */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">
          Weekly Activity
        </h3>
        <LineChart data={lineChartData} width={300} height={200} />
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">
          Game Performance
        </h3>
        <BarChart data={barChartData} width={300} height={200} />
      </div>

      {/* Pie Chart */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Win Rate</h3>
        <PieChart data={pieChartData} width={250} height={200} />
      </div>

      {/* Gauges */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">
          Performance Metrics
        </h3>
        <div className="flex justify-around">
          <Gauge
            value={75}
            max={100}
            width={120}
            height={120}
            label="Accuracy"
            unit="%"
          />
          <Gauge
            value={45}
            max={60}
            width={120}
            height={120}
            label="Speed"
            unit="s"
          />
        </div>
      </div>

      {/* Progress Rings */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Achievements</h3>
        <div className="flex justify-around">
          <ProgressRing
            value={8}
            max={10}
            width={80}
            height={80}
            label="Level"
          />
          <ProgressRing
            value={15}
            max={20}
            width={80}
            height={80}
            label="Streak"
          />
        </div>
      </div>

      {/* Sparklines */}
      <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">
          Recent Performance
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-300 mb-2">Response Time</p>
            <Sparkline
              data={[1.2, 1.5, 1.1, 1.8, 1.3, 1.6, 1.4]}
              width={250}
              height={30}
            />
          </div>
          <div>
            <p className="text-sm text-gray-300 mb-2">Accuracy Trend</p>
            <Sparkline
              data={[85, 88, 92, 89, 94, 91, 96]}
              width={250}
              height={30}
              color="#00FF41"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualizationDashboard;
