# CustomChart.js

**A modern, lightweight SVG chart library built with pure Vanilla JavaScript — zero dependencies.**

> Author: **Prakash Bodhane** &nbsp;·&nbsp; File: `CustomCharts.js`


## Features

- **11 Chart Types** — Line, Bar, Horizontal Bar, Pie, Donut (`doughnut` alias), Area, Scatter, Bubble, Radar, Mixed
- **SVG Rendering** — Crisp visuals at any screen size
- **Smooth Animations** — 10 built-in easing functions
- **Interactive** — Tooltips, hover effects, clickable legends
- **Responsive** — Adapts to any container size with ResizeObserver
- **Themes** — Built-in light and dark mode
- **Gradient Support** — Beautiful gradient fills
- **Zoom & Pan** — Optional mouse wheel zoom and drag pan
- **Real-time Data** — Live updating charts with configurable streaming via `options.realTime`
- **Export** — Save charts as SVG or PNG
- **Plugin System** — Extend with custom plugins
- **ARIA Accessible** — Screen-reader friendly markup
- **No Dependencies** — Single file, ~25KB

---

## Quick Start

Include the library and create a chart:

```html
<div id="my-chart" style="width:600px; height:400px;"></div>
<script src="CustomCharts.js"></script>
<script>
  const chart = new MyChart({
    element: '#my-chart',
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: 'Sales',
        data: [10, 20, 30, 25, 40],
        backgroundColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeOutCubic' }
    }
  });
</script>
```

---

## API Reference

### Constructor

```js
const chart = new MyChart(config);
```

| Property | Type | Description |
|----------|------|-------------|
| `element` | `string \| HTMLElement` | CSS selector or DOM element |
| `type` | `string` | Chart type (see below) |
| `data` | `object` | Labels and datasets |
| `options` | `object` | Configuration options |

### Chart Types

| Type | Value |
|------|-------|
| Line | `'line'` |
| Bar (vertical) | `'bar'` |
| Bar (horizontal) | `'horizontalBar'` |
| Pie | `'pie'` |
| Donut | `'donut'` or `'doughnut'` |
| Area | `'area'` |
| Scatter | `'scatter'` |
| Bubble | `'bubble'` |
| Radar | `'radar'` |
| Mixed (bar+line) | `'mixed'` |
| Donut (alias) | `'doughnut'` |

### Data Format

**Categorical charts (line, bar, area, pie, donut, radar):**
```js
data: {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Series Name',
    data: [10, 20, 30],
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
    tension: 0.4,          // Line smoothing (0 = straight)
    fill: true,             // Fill area under line
    pointRadius: 4,
    borderWidth: 2,
    borderRadius: 4         // Bar corner radius
  }]
}
```

**Scatter chart:**
```js
data: {
  datasets: [{
    label: 'Points',
    data: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
    pointRadius: 6
  }]
}
```

**Bubble chart:**
```js
data: {
  datasets: [{
    label: 'Bubbles',
    data: [{ x: 10, y: 20, r: 15 }, { x: 30, y: 40, r: 8 }]
  }]
}
```

**Pie / Donut — per-slice colors:**
```js
datasets: [{
  data: [65, 18, 8],
  backgroundColor: ['#6366f1', '#22c55e', '#f59e0b']
}]
```

**Mixed chart — per-dataset type:**
```js
datasets: [
  { label: 'Bars', type: 'bar', data: [10, 20, 30] },
  { label: 'Line', type: 'line', data: [15, 25, 35], tension: 0.4 }
]
```

### Options

```js
options: {
  responsive: true,
  animation: { duration: 800, easing: 'easeInOutCubic' },
  theme: 'light',             // 'light' or 'dark'
  gradient: true,             // Enable gradient fills
  padding: { top: 50, right: 30, bottom: 60, left: 65 },
  title: { text: 'My Chart', display: true, fontSize: 16 },
  legend: { display: true, position: 'top' },
  tooltip: { enabled: true },
  scales: {
    x: { display: true, gridLines: false, title: 'X Label' },
    y: { display: true, gridLines: true, title: 'Y Label', beginAtZero: true, min: 0, max: 100 }
  },
  zoom: { enabled: false },
  realTime: { enabled: false, interval: 2000, maxPoints: 20, onRefresh: (chart) => {} },
  plugins: []
}
```

### Available Easings

`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeOutBack`, `easeOutBounce`, `easeOutElastic`

### Methods

| Method | Description |
|--------|-------------|
| `chart.update(data, animate?)` | Update chart data |
| `chart.addData(label, values)` | Add a single data point (real-time) |
| `chart.setTheme('dark')` | Switch theme |
| `chart.resize()` | Force resize |
| `chart.exportSVG()` | Get SVG markup as string |
| `chart.exportPNG(scale?)` | Get PNG as data URL (Promise) |
| `chart.destroy()` | Remove chart and clean up |

### Dynamic Updates

```js
// Replace all data
chart.update({
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'New', data: [5, 15, 25] }]
});

// Real-time: push new point
chart.addData('14:30:22', [42, 18]);
```

### Export

```js
// Download as SVG
const svgString = chart.exportSVG();

// Download as PNG
chart.exportPNG(2).then(dataUrl => {
  const link = document.createElement('a');
  link.download = 'chart.png';
  link.href = dataUrl;
  link.click();
});
```

### Plugins

```js
MyChart.registerPlugin({
  afterInit(chart)   { /* called after chart is created */ },
  beforeDraw(chart)  { /* called before each draw */ },
  afterDraw(chart)   { /* called after each draw */ }
});
```

### Custom Chart Types

```js
class WaterfallChart extends BaseChart {
  _draw(progress) { /* custom rendering */ }
}
MyChart.registerType('waterfall', WaterfallChart);
```

### Themes

Built-in `light` and `dark` themes. Customize by modifying `MyChart.themes`:

```js
MyChart.themes.custom = {
  background: '#1a1a2e',
  text: '#eee',
  textSecondary: '#aaa',
  gridLine: '#333',
  axisLine: '#555',
  tooltipBg: 'rgba(0,0,0,0.85)',
  tooltipText: '#fff',
  legendText: '#ddd'
};
```

### Default Colors

Access or modify the default color palette:

```js
console.log(MyChart.colors); // Array of 15 hex colors
MyChart.colors[0] = '#ff6384'; // Override first color
```

---

## Examples

### Line Chart with Gradient

```js
new MyChart({
  element: '#chart',
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      label: 'Users',
      data: [120, 200, 150, 280, 220],
      borderColor: '#6366f1',
      tension: 0.4,
      fill: true
    }]
  },
  options: { gradient: true }
});
```

### Donut Chart with Center Label

```js
new MyChart({
  element: '#chart',
  type: 'donut',
  data: {
    labels: ['Done', 'Todo', 'Blocked'],
    datasets: [{
      data: [72, 20, 8],
      backgroundColor: ['#22c55e', '#6366f1', '#ef4444']
    }]
  },
  options: {
    cutout: 0.65,
    centerLabel: { value: '72%', label: 'Complete' }
  }
});
```

### Real-time Monitoring

```js
new MyChart({
  element: '#chart',
  type: 'line',
  data: {
    labels: [],
    datasets: [{ label: 'CPU %', data: [], borderColor: '#22c55e', tension: 0.3 }]
  },
  options: {
    animation: false,
    realTime: {
      enabled: true,
      interval: 1000,
      maxPoints: 30,
      onRefresh: (chart) => {
        const now = new Date().toLocaleTimeString();
        chart.addData(now, [Math.random() * 100]);
      }
    }
  }
});
```

---

## Browser Support

Chrome, Firefox, Safari, Edge (all modern versions with SVG and ES6 support).


*Built by [Prakash Bodhane](https://github.com/PrakashBodhane) — CustomChart.js 