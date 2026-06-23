# product-roadmap-online

product-roadmap-online is a lightweight, fully client-side web application for planning, structuring, and presenting product roadmaps — no installation, no backend, no account required.

Break work down into **Goals → Features → Tasks**, track status across the *done / now / next / later* horizons, link dependencies between items, group things into areas, estimate hours, and walk stakeholders through it all in a built-in presentation mode. Everything lives in your browser.

## Use it online

A public instance is hosted on GitHub Pages:

https://jschulz91.github.io/product-roadmap-online/

No need to clone the repository or install dependencies. Open the link and start planning. All data stays in your browser (LocalStorage) — nothing is ever uploaded to a server.

> ⚠️ This is a private hobby project. There is no guarantee that the hosted instance will remain online indefinitely, that it will be actively maintained, or that any specific feature will be available at any given time. Use at your own risk. For anything critical, export your data regularly as JSON.

## Key Features

- **Three-level hierarchy** — every roadmap is built from **Goals**, **Features**, and **Tasks**. Features nest under goals, tasks nest under features. Collapse a node to fold away its entire subtree.
- **Status tracking** — each node carries one of four statuses: `done`, `now`, `next`, `later`. Click the status badge to cycle through them.
- **Dependency edges** — connect any two nodes to express a dependency. Choose solid or dashed style, set the arrow direction (forward / backward / both / none), and add a label. Cycles are detected and prevented automatically.
- **Hierarchy edges** — parent/child links are drawn automatically and their attachment points can be re-routed by side (top / right / bottom / left).
- **Areas** — dashed-border background rectangles to group related items; give them a name and color, and resize by dragging.
- **Hours & progress** — estimate hours per node; goals and features roll up hours and completion progress from their children via progress bars.
- **Auto-layout** — one click (or `L`) arranges the visible tree with a Dagre-based layout; collapsed subtrees travel with their parent.
- **Drag & drop** — move nodes freely; dragging a collapsed node carries its hidden subtree along.
- **Presentation / Explorer mode** — a distraction-free walkthrough that drills from an overview of all goals, into a single goal's features, into a feature's tasks — with keyboard navigation, breadcrumbs, progress rings, and optional autoplay.
- **Color presets** — pick a goal color from presets or any custom hex; features and tasks inherit a tinted shade of their goal's color.
- **Undo / redo** — up to 50 steps of history.
- **Light & dark theme.**
- **Auto-save** — the current roadmap is persisted to LocalStorage automatically, so it's still there when you come back.
- **Import / Export** — JSON (lossless, re-importable).

## Save vs. Import

| Action | What it does |
| --- | --- |
| **Auto-save** | The full roadmap is written to your browser's LocalStorage on every change. Reopening the page restores it. Nothing leaves your machine. |
| **JSON Export** (`Ctrl+S`) | Downloads a `.json` file you can import on any device. Best for backups, version snapshots, and offline workflows. |
| **JSON Import** (`Ctrl+O`) | Loads a previously exported `.json` file and replaces the current roadmap. |

> **Privacy note:** All data is stored locally in your browser. Clearing your browser data will erase the roadmap unless you have exported it. Exported JSON files contain the full roadmap payload — treat them like any other confidential document.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Shift + Z` | Redo |
| `Ctrl/⌘ + S` | Export JSON |
| `Ctrl/⌘ + O` | Import JSON |
| `Delete` / `Backspace` | Delete selected node (and its subtree) |
| `Esc` | Deselect / close panel |
| `F` | Fit roadmap to view |
| `L` | Run auto-layout |
| `P` | Start presentation mode |

## Tech Stack

product-roadmap-online is a serverless Single Page Application (SPA) — one `npm run build` produces a fully static `dist/` folder.

| Layer | Technology |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Diagram engine | React Flow (`@xyflow/react` 12) |
| State management | Zustand (with LocalStorage persistence) |
| Auto-layout | Dagre (`@dagrejs/dagre`) |
| Schema / validation | Zod |
| UI primitives | Radix UI |
| Animation | Framer Motion |
| Icons | lucide-react |
| ID generation | nanoid |
| Styling | Tailwind CSS |

## Running Locally

```bash
git clone https://github.com/jschulz91/product-roadmap-online.git
cd product-roadmap-online
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Data Model

Exported JSON files follow this structure:

```json
{
  "version": "1.0",
  "name": "Produktroadmap 2026",
  "description": "Q1–Q4 Planung",
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-28T10:00:00.000Z",
  "nodes": [
    {
      "id": "abc123",
      "type": "goal",
      "position": { "x": 300, "y": 200 },
      "data": {
        "title": "Onboarding verbessern",
        "subtitle": "",
        "description": "Aktivierungsrate steigern",
        "status": "now",
        "level": "goal",
        "parentId": null,
        "childrenIds": ["def456"],
        "collapsed": false,
        "color": "#3B82F6",
        "hours": 0,
        "order": 10,
        "createdAt": "2026-04-28T10:00:00.000Z",
        "updatedAt": "2026-04-28T10:00:00.000Z"
      }
    }
  ],
  "edges": [
    {
      "id": "dep-xyz",
      "source": "abc123",
      "target": "def456",
      "sourceHandle": "right",
      "targetHandle": "left",
      "type": "dependency",
      "style": "solid",
      "direction": "forward",
      "label": "blockiert"
    }
  ],
  "areas": [
    {
      "id": "area-1",
      "name": "Backend",
      "position": { "x": 0, "y": 0 },
      "width": 360,
      "height": 240,
      "color": "#3B82F6"
    }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "settings": { "theme": "light", "autoLayout": true }
}
```

- Valid node `level` / `type` values: `goal` · `feature` · `task`
- Valid `status` values: `done` · `now` · `next` · `later`
- Valid edge `type` values: `dependency` · `hierarchy`
- Valid edge `style` values: `solid` · `dashed`
- Valid edge `direction` values: `forward` · `backward` · `both` · `none`

Hierarchy edges are derived from each node's `parentId` and are not stored in the `edges` array; only dependency edges are persisted there.

## License

MIT License — Copyright © 2026 Joshua Schulz

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This is a private hobby project maintained in spare time. The author makes no commitment to long-term uptime of the hosted instance, ongoing maintenance, or feature stability. Contributions and forks are welcome under the terms of the MIT license.

Created with Claude Opus 4.8
</content>
