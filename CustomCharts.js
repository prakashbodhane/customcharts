/**
 * CustomChart.js — Modern, Lightweight SVG Chart Library
 *  Author : Prakash Bodhane
 * Pure Vanilla JavaScript · No Dependencies
 * Supports: Line, Bar, Horizontal Bar, Pie, Donut, Area,
 *           Scatter, Bubble, Radar, Mixed, Real-time Charts
 */
(function (global) {
  'use strict';

  // ═══════════════════════════════════════════════════
  //  CONSTANTS
  // ═══════════════════════════════════════════════════
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const DEFAULT_COLORS = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6',
    '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4',
    '#84cc16', '#e11d48', '#0891b2', '#7c3aed', '#ea580c'
  ];

  const DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutCubic' },
    padding: { top: 50, right: 30, bottom: 60, left: 65 },
    theme: 'light',
    title: { text: '', display: false, fontSize: 16, fontWeight: '600' },
    legend: { display: true, position: 'top' },
    tooltip: { enabled: true },
    scales: {
      x: { display: true, gridLines: false, title: '', ticks: {} },
      y: { display: true, gridLines: true, title: '', ticks: {}, beginAtZero: true }
    },
    gradient: false,
    zoom: { enabled: false },
    realTime: { enabled: false, interval: 2000, maxPoints: 20 },
    plugins: []
  };

  const THEMES = {
    light: {
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      gridLine: '#e5e7eb',
      axisLine: '#d1d5db',
      tooltipBg: 'rgba(15, 23, 42, 0.92)',
      tooltipText: '#f8fafc',
      tooltipBorder: 'rgba(255,255,255,0.08)',
      legendText: '#374151',
      cardShadow: '0 1px 3px rgba(0,0,0,0.08)'
    },
    dark: {
      background: '#111827',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      gridLine: '#1f2937',
      axisLine: '#374151',
      tooltipBg: 'rgba(248, 250, 252, 0.95)',
      tooltipText: '#0f172a',
      tooltipBorder: 'rgba(0,0,0,0.08)',
      legendText: '#e5e7eb',
      cardShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }
  };

  // ═══════════════════════════════════════════════════
  //  EASING FUNCTIONS
  // ═══════════════════════════════════════════════════
  const EASINGS = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: t => t * t * t,
    easeOutCubic: t => --t * t * t + 1,
    easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeOutBack: t => { const s = 1.70158; return --t * t * ((s + 1) * t + s) + 1; },
    easeOutBounce: t => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    easeOutElastic: t => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
  };

  // ═══════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════
  const Utils = {
    /** Deep merge objects (target ← sources) */
    deepMerge(target, ...sources) {
      for (const src of sources) {
        if (!src) continue;
        for (const key of Object.keys(src)) {
          if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
            if (!target[key] || typeof target[key] !== 'object') target[key] = {};
            Utils.deepMerge(target[key], src[key]);
          } else {
            target[key] = src[key];
          }
        }
      }
      return target;
    },

    /** Resolve an element selector or HTMLElement */
    resolveElement(el) {
      if (typeof el === 'string') return document.querySelector(el);
      return el;
    },

    /** Clamp a number between min and max */
    clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),

    /** Round to N decimal places */
    round: (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d,

    /** Generate a unique ID */
    uid: (() => { let id = 0; return (prefix = 'mc') => `${prefix}-${++id}`; })(),

    /** Hex color to RGBA */
    hexToRgba(hex, alpha = 1) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    },

    /** Lighten a hex color */
    lighten(hex, pct) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      r = Math.min(255, Math.round(r + (255 - r) * pct));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },

    /** Get dataset color, falling back to palette */
    getColor(dataset, index, prop = 'borderColor') {
      return dataset[prop] || dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    },

    /** Format a number for display */
    formatNumber(n) {
      if (Math.abs(n) >= 1e9) return Utils.round(n / 1e9, 1) + 'B';
      if (Math.abs(n) >= 1e6) return Utils.round(n / 1e6, 1) + 'M';
      if (Math.abs(n) >= 1e3) return Utils.round(n / 1e3, 1) + 'K';
      return Utils.round(n, 2).toString();
    },

    /** Calculate nice scale values for an axis */
    niceScale(dataMin, dataMax, maxTicks = 8) {
      if (dataMin === dataMax) { dataMin -= 1; dataMax += 1; }
      const range = niceNum(dataMax - dataMin, false);
      const tickSpacing = niceNum(range / (maxTicks - 1), true);
      const nMin = Math.floor(dataMin / tickSpacing) * tickSpacing;
      const nMax = Math.ceil(dataMax / tickSpacing) * tickSpacing;
      const ticks = [];
      for (let v = nMin; v <= nMax + tickSpacing * 0.5; v += tickSpacing) {
        ticks.push(Utils.round(v, 10));
      }
      return { min: nMin, max: nMax, tickSpacing, ticks };
    },

    /** Debounce function */
    debounce(fn, ms) {
      let timer;
      return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), ms); };
    },

    /** Polar to Cartesian */
    polarToCartesian(cx, cy, r, angleDeg) {
      const rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    },

    /** Create smooth path through points (Catmull-Rom → Cubic Bezier) */
    smoothPath(points, tension = 0.4, closed = false) {
      if (points.length < 2) return '';
      if (points.length === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;

      let d = `M${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
        const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
        const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
        const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      if (closed) d += ' Z';
      return d;
    },

    /** Straight-line path through points */
    linePath(points, closed = false) {
      if (!points.length) return '';
      let d = `M${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) d += ` L${points[i].x},${points[i].y}`;
      if (closed) d += ' Z';
      return d;
    }
  };

  /** Nice-number algorithm (for axis ticks) */
  function niceNum(range, round) {
    if (range === 0) return 1;
    const exp = Math.floor(Math.log10(Math.abs(range)));
    const frac = range / Math.pow(10, exp);
    let nice;
    if (round) {
      nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
    } else {
      nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
    }
    return nice * Math.pow(10, exp);
  }

  // ═══════════════════════════════════════════════════
  //  SVG HELPERS
  // ═══════════════════════════════════════════════════
  const SVG = {
    create(tag, attrs) {
      const el = document.createElementNS(SVG_NS, tag);
      if (attrs) SVG.setAttrs(el, attrs);
      return el;
    },

    setAttrs(el, attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined) continue;
        el.setAttribute(k, v);
      }
    },

    createSvg(width, height) {
      const svg = SVG.create('svg', {
        width, height,
        viewBox: `0 0 ${width} ${height}`,
        xmlns: SVG_NS,
        class: 'mychart-svg'
      });
      svg.style.overflow = 'visible';
      return svg;
    },

    group(attrs) { return SVG.create('g', attrs); },

    rect(x, y, w, h, attrs = {}) {
      return SVG.create('rect', { x, y, width: w, height: h, rx: attrs.rx || 0, ...attrs });
    },

    circle(cx, cy, r, attrs = {}) {
      return SVG.create('circle', { cx, cy, r, ...attrs });
    },

    line(x1, y1, x2, y2, attrs = {}) {
      return SVG.create('line', { x1, y1, x2, y2, ...attrs });
    },

    path(d, attrs = {}) {
      return SVG.create('path', { d, ...attrs });
    },

    text(x, y, content, attrs = {}) {
      const el = SVG.create('text', { x, y, ...attrs });
      el.textContent = content;
      return el;
    },

    /** Create a linear gradient in a <defs> block */
    linearGradient(svg, id, color, direction = 'vertical', opacity = [0.5, 0.05]) {
      let defs = svg.querySelector('defs');
      if (!defs) { defs = SVG.create('defs'); svg.prepend(defs); }
      // Remove previous gradient with same ID
      const existing = defs.querySelector(`#${id}`);
      if (existing) existing.remove();

      const grad = SVG.create('linearGradient', {
        id,
        x1: '0%', y1: '0%',
        x2: direction === 'horizontal' ? '100%' : '0%',
        y2: direction === 'horizontal' ? '0%' : '100%'
      });
      const stop1 = SVG.create('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': opacity[0] });
      const stop2 = SVG.create('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': opacity[1] });
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
      return `url(#${id})`;
    },

    /** Create a drop-shadow filter */
    dropShadow(svg, id = 'mc-shadow') {
      let defs = svg.querySelector('defs');
      if (!defs) { defs = SVG.create('defs'); svg.prepend(defs); }
      if (defs.querySelector(`#${id}`)) return `url(#${id})`;

      const filter = SVG.create('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%' });
      const shadow = SVG.create('feDropShadow', {
        dx: 0, dy: 2, stdDeviation: 3, 'flood-opacity': 0.15, 'flood-color': '#000'
      });
      filter.appendChild(shadow);
      defs.appendChild(filter);
      return `url(#${id})`;
    },

    /** Get approximate text width */
    textWidth(str, fontSize = 12) {
      return str.toString().length * fontSize * 0.58;
    }
  };

  // ═══════════════════════════════════════════════════
  //  ANIMATION ENGINE
  // ═══════════════════════════════════════════════════
  class Animator {
    constructor() {
      this._animations = new Map();
    }

    /**
     * Animate a value from 0→1 with easing
     * @param {string} id - unique animation id
     * @param {number} duration - ms
     * @param {string} easing - easing name
     * @param {Function} onUpdate - called with progress (0→1)
     * @param {Function} [onComplete] - called when finished
     */
    animate(id, duration, easing, onUpdate, onComplete) {
      // Cancel any existing animation with this id
      if (this._animations.has(id)) cancelAnimationFrame(this._animations.get(id));

      const easeFn = EASINGS[easing] || EASINGS.easeInOutCubic;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const rawProgress = Math.min(elapsed / duration, 1);
        const progress = easeFn(rawProgress);

        onUpdate(progress, rawProgress);

        if (rawProgress < 1) {
          this._animations.set(id, requestAnimationFrame(tick));
        } else {
          this._animations.delete(id);
          if (onComplete) onComplete();
        }
      };

      this._animations.set(id, requestAnimationFrame(tick));
    }

    /** Cancel a running animation */
    cancel(id) {
      if (this._animations.has(id)) {
        cancelAnimationFrame(this._animations.get(id));
        this._animations.delete(id);
      }
    }

    /** Cancel all animations */
    cancelAll() {
      for (const [id, af] of this._animations) cancelAnimationFrame(af);
      this._animations.clear();
    }
  }

  // ═══════════════════════════════════════════════════
  //  TOOLTIP COMPONENT
  // ═══════════════════════════════════════════════════
  class Tooltip {
    constructor(container, theme) {
      this.container = container;
      this.el = document.createElement('div');
      this.el.className = 'mychart-tooltip';
      this.el.setAttribute('role', 'tooltip');
      this._applyBaseStyle();
      this.setTheme(theme);
      container.appendChild(this.el);
      this._visible = false;
    }

    _applyBaseStyle() {
      Object.assign(this.el.style, {
        position: 'absolute',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        lineHeight: '1.5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: '1000',
        maxWidth: '280px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.06)',
        transform: 'translateY(4px)',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)'
      });
    }

    setTheme(theme) {
      const t = THEMES[theme] || THEMES.light;
      this.el.style.background = t.tooltipBg;
      this.el.style.color = t.tooltipText;
      this.el.style.borderColor = t.tooltipBorder;
    }

    /**
     * Show tooltip with items
     * @param {number} x - mouse x relative to container
     * @param {number} y - mouse y relative to container
     * @param {object} data - { title, items: [{ color, label, value }] }
     */
    show(x, y, data) {
      let html = '';
      if (data.title) html += `<div style="font-weight:600;margin-bottom:4px;font-size:12px;opacity:0.7">${data.title}</div>`;
      if (data.items) {
        for (const item of data.items) {
          html += `<div style="display:flex;align-items:center;gap:8px;padding:1px 0">`;
          if (item.color) html += `<span style="width:8px;height:8px;border-radius:50%;background:${item.color};flex-shrink:0"></span>`;
          html += `<span style="opacity:0.85">${item.label}:</span> <strong>${item.value}</strong>`;
          html += `</div>`;
        }
      }
      if (data.html) html = data.html;
      this.el.innerHTML = html;

      // Position: keep within container bounds
      const cRect = this.container.getBoundingClientRect();
      const tW = this.el.offsetWidth || 150;
      const tH = this.el.offsetHeight || 60;
      let tx = x + 14;
      let ty = y - tH / 2;
      if (tx + tW > cRect.width - 5) tx = x - tW - 14;
      if (ty < 5) ty = 5;
      if (ty + tH > cRect.height - 5) ty = cRect.height - tH - 5;

      this.el.style.left = tx + 'px';
      this.el.style.top = ty + 'px';
      this.el.style.opacity = '1';
      this.el.style.transform = 'translateY(0)';
      this._visible = true;
    }

    hide() {
      this.el.style.opacity = '0';
      this.el.style.transform = 'translateY(4px)';
      this._visible = false;
    }

    destroy() {
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }

  // ═══════════════════════════════════════════════════
  //  LEGEND COMPONENT
  // ═══════════════════════════════════════════════════
  class Legend {
    constructor(container, datasets, theme, onToggle) {
      this.container = container;
      this.datasets = datasets;
      this.onToggle = onToggle;
      this.el = document.createElement('div');
      this.el.className = 'mychart-legend';
      this.el.setAttribute('role', 'list');
      this.el.setAttribute('aria-label', 'Chart legend');
      this._hidden = new Set();
      this._applyBaseStyle();
      this.setTheme(theme);
      this.render();
    }

    _applyBaseStyle() {
      Object.assign(this.el.style, {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '12px 20px',
        padding: '8px 4px',
        fontSize: '13px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: 'none'
      });
    }

    setTheme(theme) {
      this._theme = THEMES[theme] || THEMES.light;
      this.el.style.color = this._theme.legendText;
    }

    render() {
      this.el.innerHTML = '';
      this.datasets.forEach((ds, i) => {
        const color = Utils.getColor(ds, i);
        const item = document.createElement('div');
        item.setAttribute('role', 'listitem');
        item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;padding:3px 6px;border-radius:6px;transition:opacity 0.25s`;
        item.dataset.index = i;

        const hidden = this._hidden.has(i);
        if (hidden) item.style.opacity = '0.35';

        const dot = document.createElement('span');
        dot.style.cssText = `width:10px;height:10px;border-radius:3px;background:${color};transition:transform 0.2s`;
        if (hidden) dot.style.background = '#9ca3af';

        const label = document.createElement('span');
        label.textContent = ds.label || `Dataset ${i + 1}`;
        if (hidden) label.style.textDecoration = 'line-through';

        item.appendChild(dot);
        item.appendChild(label);

        item.addEventListener('click', () => {
          if (this._hidden.has(i)) this._hidden.delete(i);
          else this._hidden.add(i);
          this.render();
          if (this.onToggle) this.onToggle(i, !this._hidden.has(i));
        });

        item.addEventListener('mouseenter', () => { if (!hidden) dot.style.transform = 'scale(1.3)'; });
        item.addEventListener('mouseleave', () => { dot.style.transform = 'scale(1)'; });

        this.el.appendChild(item);
      });
    }

    isHidden(index) { return this._hidden.has(index); }

    update(datasets) {
      this.datasets = datasets;
      this.render();
    }

    destroy() {
      if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    }
  }

  // ═══════════════════════════════════════════════════
  //  AXIS & GRID
  // ═══════════════════════════════════════════════════
  const AxisGrid = {
    /**
     * Draw Y-axis with gridlines
     */
    drawYAxis(group, scale, chartArea, theme, options) {
      const { left, top, width, height } = chartArea;
      const t = THEMES[theme] || THEMES.light;
      const yOpts = (options.scales && options.scales.y) || {};

      // Axis line
      group.appendChild(SVG.line(left, top, left, top + height, {
        stroke: t.axisLine, 'stroke-width': 1
      }));

      // Ticks and grid lines
      for (const val of scale.ticks) {
        const y = top + height - ((val - scale.min) / (scale.max - scale.min)) * height;
        if (y < top - 1 || y > top + height + 1) continue;

        // Grid line
        if (yOpts.gridLines !== false) {
          group.appendChild(SVG.line(left, y, left + width, y, {
            stroke: t.gridLine, 'stroke-width': 1, 'stroke-dasharray': '0'
          }));
        }

        // Tick label
        const formatter = yOpts.ticks && yOpts.ticks.callback;
        const label = formatter ? formatter(val) : Utils.formatNumber(val);
        group.appendChild(SVG.text(left - 10, y + 4, label, {
          fill: t.textSecondary, 'font-size': 11, 'text-anchor': 'end',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }

      // Y-axis title
      if (yOpts.title) {
        const titleEl = SVG.text(0, 0, yOpts.title, {
          fill: t.text, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': '500',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          transform: `translate(${left - 48}, ${top + height / 2}) rotate(-90)`
        });
        group.appendChild(titleEl);
      }
    },

    /**
     * Draw X-axis with labels
     */
    drawXAxis(group, labels, chartArea, theme, options, bandWidth) {
      const { left, top, width, height } = chartArea;
      const t = THEMES[theme] || THEMES.light;
      const xOpts = (options.scales && options.scales.x) || {};

      // Axis line
      group.appendChild(SVG.line(left, top + height, left + width, top + height, {
        stroke: t.axisLine, 'stroke-width': 1
      }));

      // Vertical grid lines
      if (xOpts.gridLines) {
        for (let i = 0; i < labels.length; i++) {
          const x = left + (i + 0.5) * bandWidth;
          group.appendChild(SVG.line(x, top, x, top + height, {
            stroke: t.gridLine, 'stroke-width': 1
          }));
        }
      }

      // Labels
      const maxLabels = Math.max(1, Math.floor(width / 60));
      const step = labels.length > maxLabels ? Math.ceil(labels.length / maxLabels) : 1;

      for (let i = 0; i < labels.length; i++) {
        if (i % step !== 0 && i !== labels.length - 1) continue;
        const x = left + (i + 0.5) * bandWidth;
        const formatter = xOpts.ticks && xOpts.ticks.callback;
        const label = formatter ? formatter(labels[i], i) : labels[i];

        group.appendChild(SVG.text(x, top + height + 20, label, {
          fill: t.textSecondary, 'font-size': 11, 'text-anchor': 'middle',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }

      // X-axis title
      if (xOpts.title) {
        group.appendChild(SVG.text(left + width / 2, top + height + 44, xOpts.title, {
          fill: t.text, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': '500',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }
    },

    /**
     * Draw X-axis for scatter/bubble (numeric)
     */
    drawNumericXAxis(group, scale, chartArea, theme, options) {
      const { left, top, width, height } = chartArea;
      const t = THEMES[theme] || THEMES.light;
      const xOpts = (options.scales && options.scales.x) || {};

      group.appendChild(SVG.line(left, top + height, left + width, top + height, {
        stroke: t.axisLine, 'stroke-width': 1
      }));

      for (const val of scale.ticks) {
        const x = left + ((val - scale.min) / (scale.max - scale.min)) * width;
        if (x < left - 1 || x > left + width + 1) continue;

        if (xOpts.gridLines) {
          group.appendChild(SVG.line(x, top, x, top + height, {
            stroke: t.gridLine, 'stroke-width': 1
          }));
        }

        const formatter = xOpts.ticks && xOpts.ticks.callback;
        const label = formatter ? formatter(val) : Utils.formatNumber(val);
        group.appendChild(SVG.text(x, top + height + 20, label, {
          fill: t.textSecondary, 'font-size': 11, 'text-anchor': 'middle',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }

      if (xOpts.title) {
        group.appendChild(SVG.text(left + width / 2, top + height + 44, xOpts.title, {
          fill: t.text, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': '500',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }
    }
  };

  // ═══════════════════════════════════════════════════
  //  BASE CHART
  // ═══════════════════════════════════════════════════
  class BaseChart {
    constructor(config) {
      this.config = config;
      this.container = Utils.resolveElement(config.element);
      if (!this.container) throw new Error('MyChart: element not found — ' + config.element);

      // Ensure container is positioned
      const pos = getComputedStyle(this.container).position;
      if (pos === 'static') this.container.style.position = 'relative';

      this.data = JSON.parse(JSON.stringify(config.data || { labels: [], datasets: [] }));
      this.options = Utils.deepMerge({}, DEFAULTS, config.options || {});
      this.type = config.type;

      this.animator = new Animator();
      this._plugins = [...(this.options.plugins || [])];
      this._animProgress = 0;
      this._destroyed = false;

      // Theme
      this.theme = this.options.theme || 'light';

      // Sizing
      this._measure();

      // Create wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'mychart-wrapper';
      this.wrapper.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';
      this.container.appendChild(this.wrapper);

      // Legend
      if (this.options.legend.display && this.data.datasets && this.data.datasets.length > 0) {
        this.legend = new Legend(this.wrapper, this.data.datasets, this.theme, (idx, visible) => {
          this._onLegendToggle(idx, visible);
        });
        if (this.options.legend.position === 'top') {
          this.wrapper.prepend(this.legend.el);
        } else {
          this.wrapper.appendChild(this.legend.el);
        }
      }

      // SVG container
      this.svgContainer = document.createElement('div');
      this.svgContainer.className = 'mychart-svg-container';
      this.svgContainer.style.cssText = 'flex:1;min-height:0;position:relative;';
      this.wrapper.appendChild(this.svgContainer);

      // SVG
      this._createSvg();

      // Tooltip
      if (this.options.tooltip.enabled) {
        this.tooltip = new Tooltip(this.svgContainer, this.theme);
      }

      // Events
      this._bindEvents();

      // Responsive
      if (this.options.responsive && typeof ResizeObserver !== 'undefined') {
        this._resizeObserver = new ResizeObserver(Utils.debounce(() => {
          if (!this._destroyed) this.resize();
        }, 120));
        this._resizeObserver.observe(this.container);
      }

      // Plugin hooks: init
      this._callPlugins('afterInit');

      // Initial render
      this._render(true);

      // Real-time
      if (this.options.realTime && this.options.realTime.enabled) {
        this._startRealTime();
      }
    }

    /** Measure container dimensions */
    _measure() {
      const rect = this.container.getBoundingClientRect();
      this.width = Math.floor(rect.width) || 600;
      this.height = Math.floor(rect.height) || 400;
    }

    /** Create or recreate the SVG element */
    _createSvg() {
      if (this.svg && this.svg.parentNode) this.svg.parentNode.removeChild(this.svg);
      this._measureSvgArea();
      this.svg = SVG.createSvg(this.svgWidth, this.svgHeight);
      this.svg.setAttribute('role', 'img');
      this.svg.setAttribute('aria-label', this.options.title.text || this.type + ' chart');
      this.svgContainer.appendChild(this.svg);

      // Add drop shadow filter
      SVG.dropShadow(this.svg);
    }

    _measureSvgArea() {
      const sRect = this.svgContainer ? this.svgContainer.getBoundingClientRect() : { width: this.width, height: this.height - 40 };
      this.svgWidth = Math.floor(sRect.width) || this.width;
      this.svgHeight = Math.floor(sRect.height) || (this.height - 40);
    }

    /** Calculate the drawing area (inside padding) */
    _chartArea() {
      const p = this.options.padding;
      return {
        left: p.left,
        top: p.top,
        width: Math.max(10, this.svgWidth - p.left - p.right),
        height: Math.max(10, this.svgHeight - p.top - p.bottom),
        right: this.svgWidth - p.right,
        bottom: this.svgHeight - p.bottom
      };
    }

    /** Calculate Y scale from data */
    _yScale(datasets, forceMin, forceMax) {
      let min = Infinity, max = -Infinity;
      for (let d = 0; d < datasets.length; d++) {
        if (this.legend && this.legend.isHidden(d)) continue;
        const data = datasets[d].data;
        for (const v of data) {
          const val = typeof v === 'object' ? v.y : v;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      if (min === Infinity) { min = 0; max = 10; }
      if (forceMin !== undefined) min = forceMin;
      if (forceMax !== undefined) max = forceMax;
      if (this.options.scales.y.beginAtZero && min > 0) min = 0;
      return Utils.niceScale(min, max);
    }

    /** Bind mouse/touch events */
    _bindEvents() {
      this._onMouseMove = (e) => {
        if (this._destroyed) return;
        const rect = this.svgContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._handleHover(x, y, e);
      };
      this._onMouseLeave = () => {
        if (this.tooltip) this.tooltip.hide();
        this._clearHover();
      };
      this._onTouchMove = (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const rect = this.svgContainer.getBoundingClientRect();
          this._handleHover(touch.clientX - rect.left, touch.clientY - rect.top, e);
        }
      };
      this._onTouchEnd = () => {
        if (this.tooltip) this.tooltip.hide();
        this._clearHover();
      };

      this.svgContainer.addEventListener('mousemove', this._onMouseMove);
      this.svgContainer.addEventListener('mouseleave', this._onMouseLeave);
      this.svgContainer.addEventListener('touchmove', this._onTouchMove, { passive: true });
      this.svgContainer.addEventListener('touchend', this._onTouchEnd);

      // Zoom & pan
      if (this.options.zoom && this.options.zoom.enabled) {
        this._zoomLevel = 1;
        this._panOffset = { x: 0, y: 0 };
        this._setupZoomPan();
      }
    }

    /** Override in subclass to handle hover */
    _handleHover(x, y, event) {}
    _clearHover() {}

    /** Legend toggle handler */
    _onLegendToggle(idx, visible) {
      this._render(true);
    }

    /** Draw chart title */
    _drawTitle() {
      if (!this.options.title.display || !this.options.title.text) return;
      const t = THEMES[this.theme] || THEMES.light;
      this.svg.appendChild(SVG.text(this.svgWidth / 2, 28, this.options.title.text, {
        fill: t.text,
        'font-size': this.options.title.fontSize || 16,
        'font-weight': this.options.title.fontWeight || '600',
        'text-anchor': 'middle',
        'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }));
    }

    /** Render (calls subclass _draw method) */
    _render(animate = false) {
      if (this._destroyed) return;
      this.animator.cancelAll();

      // Clear SVG
      while (this.svg.lastChild) this.svg.removeChild(this.svg.lastChild);
      // Re-add defs
      SVG.dropShadow(this.svg);

      this._drawTitle();
      this._callPlugins('beforeDraw');

      if (animate && this.options.animation) {
        const anim = typeof this.options.animation === 'object' ? this.options.animation : DEFAULTS.animation;
        this.animator.animate('main', anim.duration, anim.easing, (progress) => {
          this._animProgress = progress;
          // Clear chart content (keep defs and title)
          const toRemove = [];
          for (let i = 0; i < this.svg.children.length; i++) {
            const child = this.svg.children[i];
            if (child.tagName !== 'defs' && child.tagName !== 'text') toRemove.push(child);
          }
          toRemove.forEach(c => c.remove());
          this._draw(progress);
        }, () => {
          this._callPlugins('afterDraw');
        });
      } else {
        this._animProgress = 1;
        this._draw(1);
        this._callPlugins('afterDraw');
      }
    }

    /** Override in subclass */
    _draw(progress) {}

    /** Resize handler */
    resize() {
      if (this._destroyed) return;
      this._measure();
      this._measureSvgArea();
      SVG.setAttrs(this.svg, {
        width: this.svgWidth,
        height: this.svgHeight,
        viewBox: `0 0 ${this.svgWidth} ${this.svgHeight}`
      });
      this._render(false);
    }

    /** Update data */
    update(newData, animate = true) {
      if (newData.labels) this.data.labels = newData.labels;
      if (newData.datasets) this.data.datasets = JSON.parse(JSON.stringify(newData.datasets));
      if (this.legend) this.legend.update(this.data.datasets);
      this._render(animate);
    }

    /** Add a data point (for real-time) */
    addData(label, values) {
      this.data.labels.push(label);
      const maxPts = this.options.realTime.maxPoints || 20;
      if (this.data.labels.length > maxPts) this.data.labels.shift();

      this.data.datasets.forEach((ds, i) => {
        ds.data.push(values[i] !== undefined ? values[i] : 0);
        if (ds.data.length > maxPts) ds.data.shift();
      });
      this._render(false); // No animation for real-time smoothness
    }

    /** Switch theme */
    setTheme(theme) {
      this.theme = theme;
      if (this.tooltip) this.tooltip.setTheme(theme);
      if (this.legend) this.legend.setTheme(theme);
      this._render(false);
    }

    /** Export chart as SVG string */
    exportSVG() {
      const clone = this.svg.cloneNode(true);
      const t = THEMES[this.theme] || THEMES.light;
      // Add background
      const bg = SVG.rect(0, 0, this.svgWidth, this.svgHeight, { fill: t.background, rx: 0 });
      clone.prepend(bg);
      return new XMLSerializer().serializeToString(clone);
    }

    /** Export chart as PNG data URL */
    exportPNG(scale = 2) {
      return new Promise((resolve) => {
        const svgStr = this.exportSVG();
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = this.svgWidth * scale;
          canvas.height = this.svgHeight * scale;
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = url;
      });
    }

    /** Plugin hooks */
    _callPlugins(hook) {
      for (const plugin of this._plugins) {
        if (typeof plugin[hook] === 'function') plugin[hook](this);
      }
    }

    /** Real-time data streaming */
    _startRealTime() {
      const rt = this.options.realTime;
      this._rtInterval = setInterval(() => {
        if (rt.onRefresh && typeof rt.onRefresh === 'function') {
          rt.onRefresh(this);
        }
      }, rt.interval || 2000);
    }

    /** Zoom & Pan setup */
    _setupZoomPan() {
      this.svgContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this._zoomLevel = Utils.clamp(this._zoomLevel * delta, 0.5, 5);
        this._applyZoomPan();
      }, { passive: false });

      let dragging = false, startX, startY;
      this.svgContainer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        startX = e.clientX - this._panOffset.x;
        startY = e.clientY - this._panOffset.y;
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        this._panOffset.x = e.clientX - startX;
        this._panOffset.y = e.clientY - startY;
        this._applyZoomPan();
      });
      window.addEventListener('mouseup', () => { dragging = false; });
    }

    _applyZoomPan() {
      const chartGroup = this.svg.querySelector('.mychart-chart-group');
      if (chartGroup) {
        const area = this._chartArea();
        const cx = area.left + area.width / 2;
        const cy = area.top + area.height / 2;
        chartGroup.setAttribute('transform',
          `translate(${this._panOffset.x}, ${this._panOffset.y}) ` +
          `translate(${cx}, ${cy}) scale(${this._zoomLevel}) translate(${-cx}, ${-cy})`
        );
      }
    }

    /** Destroy the chart and clean up */
    destroy() {
      this._destroyed = true;
      this.animator.cancelAll();
      if (this._rtInterval) clearInterval(this._rtInterval);
      if (this._resizeObserver) this._resizeObserver.disconnect();
      if (this.tooltip) this.tooltip.destroy();
      if (this.legend) this.legend.destroy();
      this.svgContainer.removeEventListener('mousemove', this._onMouseMove);
      this.svgContainer.removeEventListener('mouseleave', this._onMouseLeave);
      this.svgContainer.removeEventListener('touchmove', this._onTouchMove);
      this.svgContainer.removeEventListener('touchend', this._onTouchEnd);
      if (this.wrapper && this.wrapper.parentNode) this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  // ═══════════════════════════════════════════════════
  //  LINE CHART
  // ═══════════════════════════════════════════════════
  class LineChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      const yScale = this._yScale(datasets,
        this.options.scales.y.min, this.options.scales.y.max);
      const bandWidth = area.width / labels.length;

      // Axes group
      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawXAxis(axisG, labels, area, this.theme, this.options, bandWidth);
      this.svg.appendChild(axisG);

      // Chart group (for zoom/pan)
      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      // Add clip path
      this._addClipPath(chartG, area);

      this._points = [];

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._points.push([]); return; }

        const color = Utils.getColor(ds, di);
        const tension = ds.tension !== undefined ? ds.tension : 0.4;
        const lineWidth = ds.borderWidth || 2.5;
        const pointRadius = ds.pointRadius !== undefined ? ds.pointRadius : 4;

        // Calculate points
        const pts = ds.data.map((v, i) => ({
          x: area.left + (i + 0.5) * bandWidth,
          y: area.top + area.height - ((v - yScale.min) / (yScale.max - yScale.min)) * area.height,
          value: v,
          label: labels[i]
        }));
        this._points.push(pts);

        // Gradient fill under line
        if (ds.fill || this.options.gradient) {
          const gradId = Utils.uid('grad');
          const gradUrl = SVG.linearGradient(this.svg, gradId, color, 'vertical', [0.35, 0.02]);

          // Build area path
          const topPath = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
          const areaD = topPath +
            ` L${pts[pts.length - 1].x},${area.top + area.height}` +
            ` L${pts[0].x},${area.top + area.height} Z`;

          const areaEl = SVG.path(areaD, {
            fill: gradUrl, opacity: progress, 'clip-path': 'url(#chart-clip)'
          });
          chartG.appendChild(areaEl);
        }

        // Line path
        const d = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
        const line = SVG.path(d, {
          fill: 'none', stroke: color, 'stroke-width': lineWidth,
          'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          'clip-path': 'url(#chart-clip)'
        });

        // Animate line drawing
        if (progress < 1) {
          const len = this._approxPathLength(pts);
          line.setAttribute('stroke-dasharray', len);
          line.setAttribute('stroke-dashoffset', len * (1 - progress));
        }

        chartG.appendChild(line);

        // Data points
        if (pointRadius > 0) {
          pts.forEach((pt, pi) => {
            const r = pointRadius * progress;
            const circle = SVG.circle(pt.x, pt.y, r, {
              fill: '#fff', stroke: color, 'stroke-width': 2,
              class: 'mychart-point', style: 'cursor:pointer;transition:r 0.15s'
            });
            circle.dataset.di = di;
            circle.dataset.pi = pi;
            chartG.appendChild(circle);
          });
        }
      });
    }

    _approxPathLength(pts) {
      let len = 0;
      for (let i = 1; i < pts.length; i++) {
        len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      }
      return len * 1.2; // Overshoot slightly for curves
    }

    _addClipPath(group, area) {
      let defs = this.svg.querySelector('defs');
      if (!defs) { defs = SVG.create('defs'); this.svg.prepend(defs); }
      let clip = defs.querySelector('#chart-clip');
      if (clip) clip.remove();
      clip = SVG.create('clipPath', { id: 'chart-clip' });
      clip.appendChild(SVG.rect(area.left, area.top, area.width, area.height));
      defs.appendChild(clip);
    }

    _handleHover(x, y) {
      if (!this._points || !this.tooltip) return;
      const area = this._chartArea();
      const bandWidth = area.width / this.data.labels.length;

      // Find nearest label index
      const idx = Math.round((x - area.left - bandWidth / 2) / bandWidth);
      if (idx < 0 || idx >= this.data.labels.length) { this.tooltip.hide(); this._clearHover(); return; }

      const items = [];
      this._points.forEach((pts, di) => {
        if (!pts.length || (this.legend && this.legend.isHidden(di))) return;
        const pt = pts[idx];
        if (!pt) return;
        items.push({
          color: Utils.getColor(this.data.datasets[di], di),
          label: this.data.datasets[di].label || `Dataset ${di + 1}`,
          value: Utils.round(pt.value, 2)
        });
      });

      if (items.length) {
        this.tooltip.show(x, y, { title: this.data.labels[idx], items });
      }

      // Highlight points
      this._highlightPoints(idx);
    }

    _highlightPoints(idx) {
      const points = this.svg.querySelectorAll('.mychart-point');
      points.forEach(p => {
        const pi = parseInt(p.dataset.pi);
        const baseR = this.data.datasets[parseInt(p.dataset.di)].pointRadius || 4;
        p.setAttribute('r', pi === idx ? baseR * 1.6 : baseR);
      });
    }

    _clearHover() {
      const points = this.svg.querySelectorAll('.mychart-point');
      points.forEach(p => {
        const baseR = this.data.datasets[parseInt(p.dataset.di)].pointRadius || 4;
        p.setAttribute('r', baseR);
      });
    }
  }

  // ═══════════════════════════════════════════════════
  //  BAR CHART
  // ═══════════════════════════════════════════════════
  class BarChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      const yScale = this._yScale(datasets,
        this.options.scales.y.min, this.options.scales.y.max);
      const bandWidth = area.width / labels.length;

      // Count visible datasets
      const visibleDs = datasets.filter((_, i) => !(this.legend && this.legend.isHidden(i)));
      const dsCount = visibleDs.length || 1;
      const barGroupWidth = bandWidth * 0.75;
      const barWidth = barGroupWidth / dsCount;

      // Axes
      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawXAxis(axisG, labels, area, this.theme, this.options, bandWidth);
      this.svg.appendChild(axisG);

      // Chart group
      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      this._bars = [];
      let visIdx = 0;

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._bars.push([]); return; }

        const color = ds.backgroundColor || Utils.getColor(ds, di);
        const borderColor = ds.borderColor || color;
        const borderW = ds.borderWidth || 0;
        const radius = ds.borderRadius || 4;
        const dsBarBounds = [];

        ds.data.forEach((v, i) => {
          const groupX = area.left + i * bandWidth + (bandWidth - barGroupWidth) / 2;
          const bx = groupX + visIdx * barWidth;
          const fullH = ((v - yScale.min) / (yScale.max - yScale.min)) * area.height;
          const barH = fullH * progress;
          const by = area.top + area.height - barH;

          // Gradient
          let fill = color;
          if (this.options.gradient || ds.gradient) {
            const gid = Utils.uid('bgrad');
            fill = SVG.linearGradient(this.svg, gid, color, 'vertical', [1, 0.6]);
          }

          const rect = SVG.rect(bx, by, Math.max(barWidth - 2, 1), Math.max(barH, 0), {
            fill, stroke: borderColor, 'stroke-width': borderW,
            rx: radius, ry: radius,
            class: 'mychart-bar',
            style: 'cursor:pointer;transition:opacity 0.15s,filter 0.2s'
          });
          rect.dataset.di = di;
          rect.dataset.i = i;
          chartG.appendChild(rect);

          dsBarBounds.push({ x: bx, y: by, w: barWidth - 2, h: barH, value: v, label: labels[i] });
        });

        this._bars.push(dsBarBounds);
        visIdx++;
      });
    }

    _handleHover(x, y) {
      if (!this._bars || !this.tooltip) return;
      const area = this._chartArea();
      const bandWidth = area.width / this.data.labels.length;

      const idx = Math.floor((x - area.left) / bandWidth);
      if (idx < 0 || idx >= this.data.labels.length) { this.tooltip.hide(); this._clearHover(); return; }

      const items = [];
      this._bars.forEach((bars, di) => {
        if (!bars.length || (this.legend && this.legend.isHidden(di))) return;
        const bar = bars[idx];
        if (!bar) return;
        items.push({
          color: this.data.datasets[di].backgroundColor || Utils.getColor(this.data.datasets[di], di),
          label: this.data.datasets[di].label || `Dataset ${di + 1}`,
          value: Utils.round(bar.value, 2)
        });
      });

      if (items.length) this.tooltip.show(x, y, { title: this.data.labels[idx], items });
      this._highlightBars(idx);
    }

    _highlightBars(idx) {
      this.svg.querySelectorAll('.mychart-bar').forEach(bar => {
        const i = parseInt(bar.dataset.i);
        bar.style.opacity = i === idx ? '1' : '0.55';
        if (i === idx) bar.setAttribute('filter', 'url(#mc-shadow)');
        else bar.removeAttribute('filter');
      });
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-bar').forEach(bar => {
        bar.style.opacity = '1';
        bar.removeAttribute('filter');
      });
    }
  }

  // ═══════════════════════════════════════════════════
  //  HORIZONTAL BAR CHART
  // ═══════════════════════════════════════════════════
  class HorizontalBarChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      // X scale (values go horizontally)
      let min = 0, max = -Infinity;
      for (const ds of datasets) {
        for (const v of ds.data) { if (v > max) max = v; if (v < min) min = v; }
      }
      if (max <= min) max = min + 10;
      const xScale = Utils.niceScale(min, max);

      const bandHeight = area.height / labels.length;
      const visibleDs = datasets.filter((_, i) => !(this.legend && this.legend.isHidden(i)));
      const dsCount = visibleDs.length || 1;
      const barGroupH = bandHeight * 0.75;
      const barH = barGroupH / dsCount;
      const t = THEMES[this.theme] || THEMES.light;

      // Grid & axes
      const axisG = SVG.group({ class: 'mychart-axes' });

      // X axis (bottom) - values
      axisG.appendChild(SVG.line(area.left, area.top + area.height, area.right, area.top + area.height, {
        stroke: t.axisLine, 'stroke-width': 1
      }));
      for (const val of xScale.ticks) {
        const x = area.left + ((val - xScale.min) / (xScale.max - xScale.min)) * area.width;
        axisG.appendChild(SVG.line(x, area.top, x, area.top + area.height, {
          stroke: t.gridLine, 'stroke-width': 1
        }));
        axisG.appendChild(SVG.text(x, area.top + area.height + 20, Utils.formatNumber(val), {
          fill: t.textSecondary, 'font-size': 11, 'text-anchor': 'middle',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      }

      // Y axis (left) - labels
      axisG.appendChild(SVG.line(area.left, area.top, area.left, area.top + area.height, {
        stroke: t.axisLine, 'stroke-width': 1
      }));
      labels.forEach((lbl, i) => {
        const cy = area.top + (i + 0.5) * bandHeight;
        axisG.appendChild(SVG.text(area.left - 10, cy + 4, lbl, {
          fill: t.textSecondary, 'font-size': 11, 'text-anchor': 'end',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }));
      });

      this.svg.appendChild(axisG);

      // Bars
      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);
      this._bars = [];
      let visIdx = 0;

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._bars.push([]); return; }
        const color = ds.backgroundColor || Utils.getColor(ds, di);
        const radius = ds.borderRadius || 4;
        const dsBarBounds = [];

        ds.data.forEach((v, i) => {
          const groupY = area.top + i * bandHeight + (bandHeight - barGroupH) / 2;
          const by = groupY + visIdx * barH;
          const fullW = ((v - xScale.min) / (xScale.max - xScale.min)) * area.width;
          const barW = fullW * progress;

          let fill = color;
          if (this.options.gradient || ds.gradient) {
            const gid = Utils.uid('hbgrad');
            fill = SVG.linearGradient(this.svg, gid, color, 'horizontal', [1, 0.6]);
          }

          const rect = SVG.rect(area.left, by, Math.max(barW, 0), Math.max(barH - 2, 1), {
            fill, rx: radius, ry: radius,
            class: 'mychart-hbar', style: 'cursor:pointer;transition:opacity 0.15s'
          });
          rect.dataset.di = di;
          rect.dataset.i = i;
          chartG.appendChild(rect);
          dsBarBounds.push({ value: v, label: labels[i] });
        });

        this._bars.push(dsBarBounds);
        visIdx++;
      });
    }

    _handleHover(x, y) {
      if (!this._bars || !this.tooltip) return;
      const area = this._chartArea();
      const bandHeight = area.height / this.data.labels.length;
      const idx = Math.floor((y - area.top) / bandHeight);
      if (idx < 0 || idx >= this.data.labels.length) { this.tooltip.hide(); this._clearHover(); return; }

      const items = [];
      this._bars.forEach((bars, di) => {
        if (!bars.length || (this.legend && this.legend.isHidden(di))) return;
        const bar = bars[idx];
        if (!bar) return;
        items.push({
          color: this.data.datasets[di].backgroundColor || Utils.getColor(this.data.datasets[di], di),
          label: this.data.datasets[di].label || `Dataset ${di + 1}`,
          value: Utils.round(bar.value, 2)
        });
      });

      if (items.length) this.tooltip.show(x, y, { title: this.data.labels[idx], items });

      this.svg.querySelectorAll('.mychart-hbar').forEach(bar => {
        bar.style.opacity = parseInt(bar.dataset.i) === idx ? '1' : '0.55';
      });
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-hbar').forEach(bar => { bar.style.opacity = '1'; });
    }
  }

  // ═══════════════════════════════════════════════════
  //  PIE CHART
  // ═══════════════════════════════════════════════════
  class PieChart extends BaseChart {
    constructor(config) {
      // Use reduced, balanced padding for circular charts
      if (!config.options) config.options = {};
      if (!config.options.padding) {
        config.options.padding = { top: 20, right: 20, bottom: 20, left: 20 };
      }
      super(config);
      this._innerRadius = config._innerRadius || 0;
    }

    _draw(progress) {
      const area = this._chartArea();
      const ds = this.data.datasets[0];
      if (!ds || !ds.data.length) return;
      const t = THEMES[this.theme] || THEMES.light;

      // Center of the chart (use full SVG center for best layout)
      const cx = this.svgWidth / 2;
      const cy = area.top + area.height / 2;
      // Radius: use the smaller of the available dimensions, leave room for labels
      const maxR = Math.min(area.width, area.height) / 2;
      const hasOuterLabels = this._innerRadius === 0;
      const radius = maxR * (hasOuterLabels ? 0.72 : 0.85);
      const innerR = radius * this._innerRadius;

      const values = ds.data.map((v, i) => (this.legend && this.legend.isHidden(i)) ? 0 : v);
      const total = values.reduce((a, b) => a + b, 0);
      if (total === 0) return;

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      // Subtle background circle for depth
      chartG.appendChild(SVG.circle(cx, cy, radius + 4, {
        fill: 'none', stroke: t.gridLine, 'stroke-width': 1, opacity: 0.5 * progress
      }));

      // Slice gap stroke color adapts to theme
      const sliceStroke = this.theme === 'dark' ? '#1e293b' : '#ffffff';

      this._slices = [];
      this._cx = cx;
      this._cy = cy;
      this._radius = radius;
      let startAngle = 0;

      // First pass: draw slices
      values.forEach((v, i) => {
        if (v === 0) { this._slices.push(null); return; }
        const sliceAngle = (v / total) * 360 * progress;
        const endAngle = startAngle + sliceAngle;
        const color = ds.backgroundColor && ds.backgroundColor[i]
          ? ds.backgroundColor[i]
          : DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        // Apply per-slice gradient for 3D feel
        const gradId = Utils.uid('pie-sg');
        SVG.linearGradient(this.svg, gradId, color, 'vertical', [1, 0.7]);

        const d = this._slicePath(cx, cy, radius, innerR, startAngle, endAngle);
        const slice = SVG.path(d, {
          fill: `url(#${gradId})`, stroke: sliceStroke, 'stroke-width': 2.5,
          'stroke-linejoin': 'round',
          class: 'mychart-slice',
          style: 'cursor:pointer;transition:transform 0.25s ease,filter 0.25s ease,opacity 0.2s;transform-origin:' + cx + 'px ' + cy + 'px'
        });
        slice.dataset.i = i;
        chartG.appendChild(slice);

        this._slices.push({
          startAngle, endAngle, midAngle: startAngle + sliceAngle / 2,
          value: ds.data[i], label: this.data.labels[i], color
        });

        startAngle = endAngle;
      });

      // Second pass: outer labels with connector lines (Pie only, not donut)
      if (hasOuterLabels && progress > 0.6) {
        const labelOpacity = Math.min(1, (progress - 0.6) * 2.5);
        this._slices.forEach((s, i) => {
          if (!s) return;
          const pct = Utils.round((s.value / total) * 100, 1);
          const midAngle = s.startAngle + (s.endAngle - s.startAngle) / 2;

          // Inner anchor on pie edge
          const anchor = Utils.polarToCartesian(cx, cy, radius + 3, midAngle);
          // Elbow point
          const elbow = Utils.polarToCartesian(cx, cy, radius + 20, midAngle);
          // Label position (horizontal extension)
          const isRight = elbow.x >= cx;
          const labelX = isRight ? elbow.x + 22 : elbow.x - 22;
          const labelAnchor = isRight ? 'start' : 'end';

          // Connector line
          chartG.appendChild(SVG.path(
            `M${anchor.x},${anchor.y} L${elbow.x},${elbow.y} L${labelX},${elbow.y}`, {
              fill: 'none', stroke: t.textSecondary, 'stroke-width': 1,
              opacity: labelOpacity * 0.5
            }
          ));

          // Label text
          const label = s.label ? `${s.label}` : '';
          chartG.appendChild(SVG.text(labelX, elbow.y - 2, label, {
            fill: t.text, 'font-size': 12.5, 'text-anchor': labelAnchor, 'font-weight': '600',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'pointer-events': 'none', opacity: labelOpacity
          }));
          chartG.appendChild(SVG.text(labelX, elbow.y + 14, `${pct}%`, {
            fill: t.textSecondary, 'font-size': 11.5, 'text-anchor': labelAnchor, 'font-weight': '700',
            'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'pointer-events': 'none', opacity: labelOpacity
          }));

          // Small dot at connector start
          chartG.appendChild(SVG.circle(anchor.x, anchor.y, 2.5, {
            fill: s.color, opacity: labelOpacity
          }));
        });
      }

      // Donut: inner percentage labels on the arc
      if (this._innerRadius > 0) {
        this._slices.forEach((s, i) => {
          if (!s) return;
          const sliceAngle = s.endAngle - s.startAngle;
          if (sliceAngle > 28 && progress > 0.5) {
            const labelR = (radius + innerR) / 2;
            const mid = Utils.polarToCartesian(cx, cy, labelR, s.startAngle + sliceAngle / 2);
            const pct = Utils.round((s.value / total) * 100, 1) + '%';
            chartG.appendChild(SVG.text(mid.x, mid.y + 5, pct, {
              fill: '#fff', 'font-size': 14, 'text-anchor': 'middle', 'font-weight': '700',
              'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              'pointer-events': 'none', opacity: Math.min(1, (progress - 0.5) * 2)
            }));
          }
        });
      }

      // Center label for donut
      if (this._innerRadius > 0 && this._centerLabel) {
        // Decorative inner ring
        chartG.appendChild(SVG.circle(cx, cy, innerR - 4, {
          fill: 'none', stroke: t.gridLine, 'stroke-width': 1, opacity: 0.4 * progress,
          'stroke-dasharray': '4,4'
        }));
        // Background circle for center area
        chartG.appendChild(SVG.circle(cx, cy, innerR - 1, {
          fill: t.background, opacity: 0.6 * progress
        }));

        const valueSize = Math.min(36, innerR * 0.6);
        const labelSize = Math.min(14, innerR * 0.24);
        chartG.appendChild(SVG.text(cx, cy + valueSize * 0.12, this._centerLabel.value || '', {
          fill: t.text, 'font-size': valueSize, 'text-anchor': 'middle', 'font-weight': '800',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          opacity: progress, 'letter-spacing': '-0.5'
        }));
        chartG.appendChild(SVG.text(cx, cy + valueSize * 0.12 + labelSize + 6, this._centerLabel.label || '', {
          fill: t.textSecondary, 'font-size': labelSize, 'text-anchor': 'middle', 'font-weight': '500',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          opacity: progress * 0.8
        }));
      }
    }

    _slicePath(cx, cy, r, innerR, startAngle, endAngle) {
      if (endAngle - startAngle >= 360) {
        const p1 = Utils.polarToCartesian(cx, cy, r, 0);
        const p2 = Utils.polarToCartesian(cx, cy, r, 180);
        let d = `M${p1.x},${p1.y} A${r},${r} 0 1 1 ${p2.x},${p2.y} A${r},${r} 0 1 1 ${p1.x},${p1.y}`;
        if (innerR > 0) {
          const ip1 = Utils.polarToCartesian(cx, cy, innerR, 0);
          const ip2 = Utils.polarToCartesian(cx, cy, innerR, 180);
          d += ` M${ip1.x},${ip1.y} A${innerR},${innerR} 0 1 0 ${ip2.x},${ip2.y} A${innerR},${innerR} 0 1 0 ${ip1.x},${ip1.y}`;
        }
        return d;
      }

      const outerStart = Utils.polarToCartesian(cx, cy, r, startAngle);
      const outerEnd = Utils.polarToCartesian(cx, cy, r, endAngle);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;

      if (innerR > 0) {
        const innerStart = Utils.polarToCartesian(cx, cy, innerR, startAngle);
        const innerEnd = Utils.polarToCartesian(cx, cy, innerR, endAngle);
        return [
          `M${outerStart.x},${outerStart.y}`,
          `A${r},${r} 0 ${largeArc} 1 ${outerEnd.x},${outerEnd.y}`,
          `L${innerEnd.x},${innerEnd.y}`,
          `A${innerR},${innerR} 0 ${largeArc} 0 ${innerStart.x},${innerStart.y}`,
          'Z'
        ].join(' ');
      }

      return [
        `M${cx},${cy}`,
        `L${outerStart.x},${outerStart.y}`,
        `A${r},${r} 0 ${largeArc} 1 ${outerEnd.x},${outerEnd.y}`,
        'Z'
      ].join(' ');
    }

    _handleHover(x, y) {
      if (!this._slices || !this.tooltip) return;
      const cx = this._cx, cy = this._cy, radius = this._radius;
      if (!radius) return;
      const innerR = radius * this._innerRadius;

      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > radius * 1.05 || dist < innerR * 0.95) { this.tooltip.hide(); this._clearHover(); return; }

      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;

      let found = -1;
      for (let i = 0; i < this._slices.length; i++) {
        const s = this._slices[i];
        if (!s) continue;
        if (angle >= s.startAngle && angle < s.endAngle) { found = i; break; }
      }

      if (found >= 0) {
        const s = this._slices[found];
        const ds = this.data.datasets[0];
        const total = ds.data.reduce((a, b) => a + b, 0);
        const pct = Utils.round((s.value / total) * 100, 1);
        this.tooltip.show(x, y, {
          title: s.label,
          items: [{ color: s.color, label: ds.label || 'Value', value: `${s.value} (${pct}%)` }]
        });
        this._highlightSlice(found);
      } else {
        this.tooltip.hide();
        this._clearHover();
      }
    }

    _highlightSlice(idx) {
      this.svg.querySelectorAll('.mychart-slice').forEach(s => {
        const i = parseInt(s.dataset.i);
        if (i === idx) {
          s.style.transform = 'scale(1.05)';
          s.setAttribute('filter', 'url(#mc-shadow)');
          s.style.opacity = '1';
        } else {
          s.style.transform = 'scale(0.97)';
          s.style.opacity = '0.5';
          s.removeAttribute('filter');
        }
      });
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-slice').forEach(s => {
        s.style.transform = 'scale(1)';
        s.style.opacity = '1';
        s.removeAttribute('filter');
      });
    }
  }

  // ═══════════════════════════════════════════════════
  //  DONUT CHART
  // ═══════════════════════════════════════════════════
  class DonutChart extends PieChart {
    constructor(config) {
      config._innerRadius = (config.options && config.options.cutout) || 0.58;
      // Use balanced padding for donut
      if (!config.options) config.options = {};
      if (!config.options.padding) {
        config.options.padding = { top: 20, right: 20, bottom: 20, left: 20 };
      }
      super(config);
      this._centerLabel = config.options && config.options.centerLabel
        ? config.options.centerLabel
        : { value: '', label: '' };
    }
  }

  // ═══════════════════════════════════════════════════
  //  AREA CHART
  // ═══════════════════════════════════════════════════
  class AreaChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      const yScale = this._yScale(datasets,
        this.options.scales.y.min, this.options.scales.y.max);
      const bandWidth = area.width / labels.length;

      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawXAxis(axisG, labels, area, this.theme, this.options, bandWidth);
      this.svg.appendChild(axisG);

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      // Clip path
      let defs = this.svg.querySelector('defs');
      if (!defs) { defs = SVG.create('defs'); this.svg.prepend(defs); }
      let clip = defs.querySelector('#chart-clip');
      if (clip) clip.remove();
      clip = SVG.create('clipPath', { id: 'chart-clip' });
      clip.appendChild(SVG.rect(area.left, area.top, area.width, area.height));
      defs.appendChild(clip);

      this._points = [];

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._points.push([]); return; }

        const color = Utils.getColor(ds, di);
        const tension = ds.tension !== undefined ? ds.tension : 0.4;
        const lineWidth = ds.borderWidth || 2;

        const pts = ds.data.map((v, i) => ({
          x: area.left + (i + 0.5) * bandWidth,
          y: area.top + area.height - ((v - yScale.min) / (yScale.max - yScale.min)) * area.height * progress,
          value: v,
          label: labels[i]
        }));
        this._points.push(pts);

        // Gradient area fill
        const gradId = Utils.uid('agrad');
        const gradUrl = SVG.linearGradient(this.svg, gradId, color, 'vertical', [0.4, 0.02]);

        const topPath = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
        const areaD = topPath +
          ` L${pts[pts.length - 1].x},${area.top + area.height}` +
          ` L${pts[0].x},${area.top + area.height} Z`;

        chartG.appendChild(SVG.path(areaD, {
          fill: gradUrl, 'clip-path': 'url(#chart-clip)', opacity: progress
        }));

        // Line on top
        const lineD = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
        chartG.appendChild(SVG.path(lineD, {
          fill: 'none', stroke: color, 'stroke-width': lineWidth,
          'stroke-linecap': 'round', 'clip-path': 'url(#chart-clip)'
        }));

        // Points
        pts.forEach((pt, pi) => {
          const circle = SVG.circle(pt.x, pt.y, 3.5 * progress, {
            fill: '#fff', stroke: color, 'stroke-width': 2,
            class: 'mychart-point', style: 'cursor:pointer;transition:r 0.15s'
          });
          circle.dataset.di = di;
          circle.dataset.pi = pi;
          chartG.appendChild(circle);
        });
      });
    }

    _handleHover(x, y) {
      if (!this._points || !this.tooltip) return;
      const area = this._chartArea();
      const bandWidth = area.width / this.data.labels.length;
      const idx = Math.round((x - area.left - bandWidth / 2) / bandWidth);
      if (idx < 0 || idx >= this.data.labels.length) { this.tooltip.hide(); return; }

      const items = [];
      this._points.forEach((pts, di) => {
        if (!pts.length || (this.legend && this.legend.isHidden(di))) return;
        const pt = pts[idx];
        if (!pt) return;
        items.push({
          color: Utils.getColor(this.data.datasets[di], di),
          label: this.data.datasets[di].label || `Dataset ${di + 1}`,
          value: Utils.round(pt.value, 2)
        });
      });

      if (items.length) this.tooltip.show(x, y, { title: this.data.labels[idx], items });

      this.svg.querySelectorAll('.mychart-point').forEach(p => {
        const pi = parseInt(p.dataset.pi);
        p.setAttribute('r', pi === idx ? 6 : 3.5);
      });
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-point').forEach(p => { p.setAttribute('r', 3.5); });
    }
  }

  // ═══════════════════════════════════════════════════
  //  SCATTER CHART
  // ═══════════════════════════════════════════════════
  class ScatterChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      if (!datasets.length) return;

      // Gather all x,y values
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) return;
        for (const pt of ds.data) {
          if (pt.x < xMin) xMin = pt.x;
          if (pt.x > xMax) xMax = pt.x;
          if (pt.y < yMin) yMin = pt.y;
          if (pt.y > yMax) yMax = pt.y;
        }
      });
      if (xMin === Infinity) { xMin = 0; xMax = 10; yMin = 0; yMax = 10; }

      const xScale = Utils.niceScale(xMin, xMax);
      const yScale = Utils.niceScale(yMin, yMax);

      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawNumericXAxis(axisG, xScale, area, this.theme, this.options);
      this.svg.appendChild(axisG);

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      this._pointData = [];

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._pointData.push([]); return; }
        const color = Utils.getColor(ds, di);
        const r = ds.pointRadius || 5;
        const ptData = [];

        ds.data.forEach((pt, pi) => {
          const px = area.left + ((pt.x - xScale.min) / (xScale.max - xScale.min)) * area.width;
          const py = area.top + area.height - ((pt.y - yScale.min) / (yScale.max - yScale.min)) * area.height;

          const circle = SVG.circle(px, py, r * progress, {
            fill: Utils.hexToRgba(color, 0.7), stroke: color, 'stroke-width': 1.5,
            class: 'mychart-scatter-point',
            style: 'cursor:pointer;transition:r 0.15s,opacity 0.15s'
          });
          circle.dataset.di = di;
          circle.dataset.pi = pi;
          chartG.appendChild(circle);
          ptData.push({ px, py, ...pt });
        });

        this._pointData.push(ptData);
      });
    }

    _handleHover(x, y) {
      if (!this._pointData || !this.tooltip) return;
      let closest = null, minDist = 30;

      this._pointData.forEach((pts, di) => {
        if (this.legend && this.legend.isHidden(di)) return;
        pts.forEach((pt, pi) => {
          const d = Math.hypot(pt.px - x, pt.py - y);
          if (d < minDist) { minDist = d; closest = { di, pi, pt }; }
        });
      });

      if (closest) {
        const ds = this.data.datasets[closest.di];
        this.tooltip.show(x, y, {
          items: [{
            color: Utils.getColor(ds, closest.di),
            label: ds.label || 'Point',
            value: `(${closest.pt.x}, ${closest.pt.y})`
          }]
        });
        this.svg.querySelectorAll('.mychart-scatter-point').forEach(p => {
          const pdi = parseInt(p.dataset.di), ppi = parseInt(p.dataset.pi);
          if (pdi === closest.di && ppi === closest.pi) {
            p.setAttribute('r', (ds.pointRadius || 5) * 1.5);
          } else {
            p.setAttribute('r', this.data.datasets[pdi].pointRadius || 5);
            p.style.opacity = '0.4';
          }
        });
      } else {
        this.tooltip.hide();
        this._clearHover();
      }
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-scatter-point').forEach(p => {
        const ds = this.data.datasets[parseInt(p.dataset.di)];
        p.setAttribute('r', ds.pointRadius || 5);
        p.style.opacity = '1';
      });
    }
  }

  // ═══════════════════════════════════════════════════
  //  BUBBLE CHART
  // ═══════════════════════════════════════════════════
  class BubbleChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      if (!datasets.length) return;

      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, rMax = 0;
      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) return;
        for (const pt of ds.data) {
          if (pt.x < xMin) xMin = pt.x;
          if (pt.x > xMax) xMax = pt.x;
          if (pt.y < yMin) yMin = pt.y;
          if (pt.y > yMax) yMax = pt.y;
          if (pt.r > rMax) rMax = pt.r;
        }
      });
      if (xMin === Infinity) { xMin = 0; xMax = 10; yMin = 0; yMax = 10; rMax = 10; }

      const xScale = Utils.niceScale(xMin, xMax);
      const yScale = Utils.niceScale(yMin, yMax);
      const maxBubbleR = Math.min(area.width, area.height) * 0.08;

      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawNumericXAxis(axisG, xScale, area, this.theme, this.options);
      this.svg.appendChild(axisG);

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      this._bubbleData = [];

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._bubbleData.push([]); return; }
        const color = Utils.getColor(ds, di);
        const bData = [];

        ds.data.forEach((pt, pi) => {
          const px = area.left + ((pt.x - xScale.min) / (xScale.max - xScale.min)) * area.width;
          const py = area.top + area.height - ((pt.y - yScale.min) / (yScale.max - yScale.min)) * area.height;
          const br = (pt.r / (rMax || 1)) * maxBubbleR * progress;

          const circle = SVG.circle(px, py, br, {
            fill: Utils.hexToRgba(color, 0.5), stroke: color, 'stroke-width': 1.5,
            class: 'mychart-bubble',
            style: 'cursor:pointer;transition:r 0.15s,opacity 0.15s'
          });
          circle.dataset.di = di;
          circle.dataset.pi = pi;
          chartG.appendChild(circle);
          bData.push({ px, py, ...pt });
        });

        this._bubbleData.push(bData);
      });
    }

    _handleHover(x, y) {
      if (!this._bubbleData || !this.tooltip) return;
      let closest = null, minDist = 60;

      this._bubbleData.forEach((pts, di) => {
        if (this.legend && this.legend.isHidden(di)) return;
        pts.forEach((pt, pi) => {
          const d = Math.hypot(pt.px - x, pt.py - y);
          if (d < minDist) { minDist = d; closest = { di, pi, pt }; }
        });
      });

      if (closest) {
        const ds = this.data.datasets[closest.di];
        this.tooltip.show(x, y, {
          items: [{
            color: Utils.getColor(ds, closest.di),
            label: ds.label || 'Bubble',
            value: `x:${closest.pt.x} y:${closest.pt.y} size:${closest.pt.r}`
          }]
        });
      } else {
        this.tooltip.hide();
      }
    }

    _clearHover() {}
  }

  // ═══════════════════════════════════════════════════
  //  RADAR CHART
  // ═══════════════════════════════════════════════════
  class RadarChart extends BaseChart {
    constructor(config) {
      // Use reduced balanced padding for radar
      if (!config.options) config.options = {};
      if (!config.options.padding) {
        config.options.padding = { top: 25, right: 25, bottom: 25, left: 25 };
      }
      super(config);
    }

    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      const cx = this.svgWidth / 2;
      const cy = area.top + area.height / 2;
      const radius = Math.min(area.width, area.height) / 2 * 0.78;
      const n = labels.length;
      const angleStep = 360 / n;

      const t = THEMES[this.theme] || THEMES.light;

      // Find max value across all datasets
      let maxVal = 0;
      datasets.forEach(ds => { for (const v of ds.data) if (v > maxVal) maxVal = v; });
      if (maxVal === 0) maxVal = 100;
      const scale = Utils.niceScale(0, maxVal);
      maxVal = scale.max;

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      // Outer decorative circle
      chartG.appendChild(SVG.circle(cx, cy, radius + 6, {
        fill: 'none', stroke: t.gridLine, 'stroke-width': 1,
        opacity: 0.3 * progress, 'stroke-dasharray': '3,3'
      }));

      // Draw radar grid with alternating filled bands for depth
      const levels = scale.ticks.length;
      for (let l = levels - 1; l >= 0; l--) {
        const r = (scale.ticks[l] / maxVal) * radius;
        const pts = [];
        for (let i = 0; i < n; i++) {
          pts.push(Utils.polarToCartesian(cx, cy, r, i * angleStep));
        }

        // Alternating fill bands
        const bandFill = l % 2 === 0
          ? (this.theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(99,102,241,0.025)')
          : (this.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)');

        chartG.appendChild(SVG.path(Utils.linePath(pts, true), {
          fill: bandFill, stroke: t.gridLine, 'stroke-width': 0.8, opacity: progress
        }));
      }

      // Draw spokes with subtle styling
      for (let i = 0; i < n; i++) {
        const end = Utils.polarToCartesian(cx, cy, radius, i * angleStep);
        chartG.appendChild(SVG.line(cx, cy, end.x, end.y, {
          stroke: t.gridLine, 'stroke-width': 0.8, opacity: 0.7
        }));

        // Small dot at spoke end
        chartG.appendChild(SVG.circle(end.x, end.y, 2, {
          fill: t.gridLine, opacity: 0.5 * progress
        }));

        // Axis labels with pill-shaped background
        const labelR = radius + 26;
        const lp = Utils.polarToCartesian(cx, cy, labelR, i * angleStep);
        let anchor = 'middle';
        let dx = 0;
        if (lp.x < cx - 8) { anchor = 'end'; dx = -2; }
        else if (lp.x > cx + 8) { anchor = 'start'; dx = 2; }

        // Label background pill
        const lblText = labels[i];
        const estW = SVG.textWidth(lblText, 13) + 16;
        const pillX = anchor === 'end' ? lp.x - estW + dx + 3 : anchor === 'start' ? lp.x + dx - 5 : lp.x - estW / 2;
        chartG.appendChild(SVG.rect(pillX, lp.y - 11, estW, 22, {
          fill: t.background, rx: 10, ry: 10, opacity: 0.85 * progress,
          stroke: t.gridLine, 'stroke-width': 0.5
        }));

        chartG.appendChild(SVG.text(lp.x + dx, lp.y + 4, lblText, {
          fill: t.text, 'font-size': 13, 'text-anchor': anchor, 'font-weight': '600',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          opacity: progress
        }));
      }

      // Level value labels (along the first spoke, skipping zero)
      for (let l = 1; l < levels; l++) {
        const r = (scale.ticks[l] / maxVal) * radius;
        const labelPt = Utils.polarToCartesian(cx, cy, r, 0);
        chartG.appendChild(SVG.text(labelPt.x + 6, labelPt.y - 5, Utils.formatNumber(scale.ticks[l]), {
          fill: t.textSecondary, 'font-size': 9, 'font-weight': '500',
          'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          opacity: 0.65 * progress
        }));
      }

      // Draw dataset polygons
      this._polyData = [];

      datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) { this._polyData.push(null); return; }
        const color = Utils.getColor(ds, di);
        const pts = ds.data.map((v, i) => {
          const r = (v / maxVal) * radius * progress;
          return Utils.polarToCartesian(cx, cy, r, i * angleStep);
        });

        // Gradient fill for polygon
        const gradId = Utils.uid('radar-g');
        SVG.linearGradient(this.svg, gradId, color, 'vertical', [0.3, 0.08]);

        // Filled polygon with gradient
        chartG.appendChild(SVG.path(Utils.linePath(pts, true), {
          fill: `url(#${gradId})`,
          stroke: color, 'stroke-width': 2.5,
          'stroke-linejoin': 'round',
          opacity: progress
        }));

        // Glow line on top (slightly brighter, thinner)
        chartG.appendChild(SVG.path(Utils.linePath(pts, true), {
          fill: 'none',
          stroke: color, 'stroke-width': 1,
          'stroke-linejoin': 'round',
          opacity: progress * 0.5,
          filter: 'url(#mc-shadow)'
        }));

        // Data points with bigger radius and glow
        pts.forEach((pt, pi) => {
          // Glow behind point
          chartG.appendChild(SVG.circle(pt.x, pt.y, 8 * progress, {
            fill: color, opacity: 0.12 * progress, 'pointer-events': 'none'
          }));
          const circle = SVG.circle(pt.x, pt.y, 4.5 * progress, {
            fill: '#fff', stroke: color, 'stroke-width': 2.5,
            class: 'mychart-radar-point', style: 'cursor:pointer;transition:r 0.18s ease'
          });
          circle.dataset.di = di;
          circle.dataset.pi = pi;
          chartG.appendChild(circle);
        });

        this._polyData.push(ds.data.map((v, i) => ({
          value: v, label: labels[i],
          pt: pts[i], color
        })));
      });
    }

    _handleHover(x, y) {
      if (!this._polyData || !this.tooltip) return;
      let closest = null, minDist = 30;

      this._polyData.forEach((data, di) => {
        if (!data) return;
        data.forEach((d, pi) => {
          const dist = Math.hypot(d.pt.x - x, d.pt.y - y);
          if (dist < minDist) { minDist = dist; closest = { di, pi, ...d }; }
        });
      });

      if (closest) {
        const ds = this.data.datasets[closest.di];
        this.tooltip.show(x, y, {
          title: closest.label,
          items: [{
            color: closest.color,
            label: ds.label || 'Value',
            value: closest.value
          }]
        });
        this.svg.querySelectorAll('.mychart-radar-point').forEach(p => {
          const pdi = parseInt(p.dataset.di), ppi = parseInt(p.dataset.pi);
          if (pdi === closest.di && ppi === closest.pi) {
            p.setAttribute('r', 7);
            p.style.filter = 'url(#mc-shadow)';
          } else {
            p.setAttribute('r', 4.5);
            p.style.filter = '';
          }
        });
      } else {
        this.tooltip.hide();
        this._clearHover();
      }
    }

    _clearHover() {
      this.svg.querySelectorAll('.mychart-radar-point').forEach(p => {
        p.setAttribute('r', 4.5);
        p.style.filter = '';
      });
    }
  }

  // ═══════════════════════════════════════════════════
  //  MIXED CHART (Bar + Line combination)
  // ═══════════════════════════════════════════════════
  class MixedChart extends BaseChart {
    _draw(progress) {
      const area = this._chartArea();
      const datasets = this.data.datasets;
      const labels = this.data.labels;
      if (!labels.length || !datasets.length) return;

      const yScale = this._yScale(datasets,
        this.options.scales.y.min, this.options.scales.y.max);
      const bandWidth = area.width / labels.length;

      const axisG = SVG.group({ class: 'mychart-axes' });
      AxisGrid.drawYAxis(axisG, yScale, area, this.theme, this.options);
      AxisGrid.drawXAxis(axisG, labels, area, this.theme, this.options, bandWidth);
      this.svg.appendChild(axisG);

      const chartG = SVG.group({ class: 'mychart-chart-group' });
      this.svg.appendChild(chartG);

      // Clip path
      let defs = this.svg.querySelector('defs');
      if (!defs) { defs = SVG.create('defs'); this.svg.prepend(defs); }
      let clip = defs.querySelector('#chart-clip');
      if (clip) clip.remove();
      clip = SVG.create('clipPath', { id: 'chart-clip' });
      clip.appendChild(SVG.rect(area.left, area.top, area.width, area.height));
      defs.appendChild(clip);

      // Separate bar and line datasets
      const barDatasets = [];
      const lineDatasets = [];
      datasets.forEach((ds, i) => {
        if (this.legend && this.legend.isHidden(i)) return;
        const dsType = ds.type || 'bar';
        if (dsType === 'line') lineDatasets.push({ ds, i });
        else barDatasets.push({ ds, i });
      });

      // Draw bars first
      const barCount = barDatasets.length || 1;
      const barGroupWidth = bandWidth * 0.6;
      const barW = barGroupWidth / barCount;

      this._bars = [];
      this._points = [];

      barDatasets.forEach(({ ds, i }, vi) => {
        const color = ds.backgroundColor || Utils.getColor(ds, i);
        const radius = ds.borderRadius || 4;
        const barsInfo = [];

        ds.data.forEach((v, li) => {
          const groupX = area.left + li * bandWidth + (bandWidth - barGroupWidth) / 2;
          const bx = groupX + vi * barW;
          const fullH = ((v - yScale.min) / (yScale.max - yScale.min)) * area.height;
          const barH = fullH * progress;
          const by = area.top + area.height - barH;

          let fill = color;
          if (this.options.gradient || ds.gradient) {
            const gid = Utils.uid('mbgrad');
            fill = SVG.linearGradient(this.svg, gid, color, 'vertical', [1, 0.6]);
          }

          chartG.appendChild(SVG.rect(bx, by, Math.max(barW - 2, 1), Math.max(barH, 0), {
            fill, rx: radius, ry: radius,
            class: 'mychart-bar', style: 'transition:opacity 0.15s'
          }));
          barsInfo.push({ value: v, label: labels[li] });
        });
        this._bars.push({ dsIndex: i, bars: barsInfo });
      });

      // Draw lines on top
      lineDatasets.forEach(({ ds, i }) => {
        const color = Utils.getColor(ds, i);
        const tension = ds.tension !== undefined ? ds.tension : 0.4;
        const lineWidth = ds.borderWidth || 2.5;

        const pts = ds.data.map((v, li) => ({
          x: area.left + (li + 0.5) * bandWidth,
          y: area.top + area.height - ((v - yScale.min) / (yScale.max - yScale.min)) * area.height,
          value: v, label: labels[li]
        }));

        // Fill area if specified
        if (ds.fill) {
          const gradId = Utils.uid('mlgrad');
          const gradUrl = SVG.linearGradient(this.svg, gradId, color, 'vertical', [0.3, 0.02]);
          const topPath = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
          const areaD = topPath +
            ` L${pts[pts.length - 1].x},${area.top + area.height}` +
            ` L${pts[0].x},${area.top + area.height} Z`;
          chartG.appendChild(SVG.path(areaD, {
            fill: gradUrl, opacity: progress, 'clip-path': 'url(#chart-clip)'
          }));
        }

        const d = tension > 0 ? Utils.smoothPath(pts, tension) : Utils.linePath(pts);
        const line = SVG.path(d, {
          fill: 'none', stroke: color, 'stroke-width': lineWidth,
          'stroke-linecap': 'round', 'clip-path': 'url(#chart-clip)'
        });
        if (progress < 1) {
          let len = 0;
          for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j].x - pts[j-1].x, pts[j].y - pts[j-1].y);
          len *= 1.2;
          line.setAttribute('stroke-dasharray', len);
          line.setAttribute('stroke-dashoffset', len * (1 - progress));
        }
        chartG.appendChild(line);

        // Points
        pts.forEach((pt, pi) => {
          chartG.appendChild(SVG.circle(pt.x, pt.y, 4 * progress, {
            fill: '#fff', stroke: color, 'stroke-width': 2,
            class: 'mychart-point', style: 'cursor:pointer;transition:r 0.15s'
          }));
        });

        this._points.push({ dsIndex: i, pts });
      });
    }

    _handleHover(x, y) {
      if (!this.tooltip) return;
      const area = this._chartArea();
      const bandWidth = area.width / this.data.labels.length;
      const idx = Math.round((x - area.left - bandWidth / 2) / bandWidth);
      if (idx < 0 || idx >= this.data.labels.length) { this.tooltip.hide(); return; }

      const items = [];
      this.data.datasets.forEach((ds, di) => {
        if (this.legend && this.legend.isHidden(di)) return;
        items.push({
          color: ds.backgroundColor || Utils.getColor(ds, di),
          label: ds.label || `Dataset ${di + 1}`,
          value: Utils.round(ds.data[idx], 2)
        });
      });

      if (items.length) this.tooltip.show(x, y, { title: this.data.labels[idx], items });
    }

    _clearHover() {}
  }

  // ═══════════════════════════════════════════════════
  //  CHART FACTORY
  // ═══════════════════════════════════════════════════
  const CHART_TYPES = {
    line: LineChart,
    bar: BarChart,
    horizontalBar: HorizontalBarChart,
    pie: PieChart,
    donut: DonutChart,
    doughnut: DonutChart,
    area: AreaChart,
    scatter: ScatterChart,
    bubble: BubbleChart,
    radar: RadarChart,
    mixed: MixedChart
  };

  /** Plugin registry */
  const pluginRegistry = [];

  /**
   * MyChart — Main entry point / factory
   * Creates the appropriate chart type based on config.type
   */
  class MyChart {
    constructor(config) {
      const ChartClass = CHART_TYPES[config.type];
      if (!ChartClass) throw new Error(`MyChart: Unknown chart type "${config.type}". Available: ${Object.keys(CHART_TYPES).join(', ')}`);

      // Inject global plugins
      if (!config.options) config.options = {};
      if (!config.options.plugins) config.options.plugins = [];
      config.options.plugins = [...pluginRegistry, ...config.options.plugins];

      const instance = new ChartClass(config);

      // Copy methods onto this for API compatibility
      this._instance = instance;
      this.update = instance.update.bind(instance);
      this.destroy = instance.destroy.bind(instance);
      this.resize = instance.resize.bind(instance);
      this.setTheme = instance.setTheme.bind(instance);
      this.addData = instance.addData.bind(instance);
      this.exportSVG = instance.exportSVG.bind(instance);
      this.exportPNG = instance.exportPNG.bind(instance);
    }
  }

  /** Register a global plugin */
  MyChart.registerPlugin = function (plugin) {
    pluginRegistry.push(plugin);
  };

  /** Access available chart types */
  MyChart.types = Object.keys(CHART_TYPES);

  /** Register a custom chart type */
  MyChart.registerType = function (name, ChartClass) {
    CHART_TYPES[name] = ChartClass;
  };

  /** Expose utilities, defaults, and themes for customization */
  MyChart.defaults = DEFAULTS;
  MyChart.themes = THEMES;
  MyChart.colors = DEFAULT_COLORS;
  MyChart.utils = Utils;
  MyChart.version = '1.0.0';

  // ═══════════════════════════════════════════════════
  //  INJECT BASE CSS
  // ═══════════════════════════════════════════════════
  (function injectCSS() {
    if (document.getElementById('mychart-base-css')) return;
    const style = document.createElement('style');
    style.id = 'mychart-base-css';
    style.textContent = `
      .mychart-svg { display: block; }
      .mychart-wrapper { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .mychart-bar, .mychart-hbar { transition: opacity 0.18s ease, filter 0.2s ease; }
      .mychart-slice { transition: transform 0.22s ease, filter 0.22s ease, opacity 0.2s ease; }
      .mychart-point, .mychart-scatter-point, .mychart-radar-point, .mychart-bubble {
        transition: r 0.15s ease, opacity 0.18s ease;
      }
    `;
    document.head.appendChild(style);
  })();

  // Export to global
  global.MyChart = MyChart;

})(typeof window !== 'undefined' ? window : this);
