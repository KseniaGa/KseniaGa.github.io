# Todo Terrarium

A standalone static React app, served at `/todo-terrarium/`. Open `index.html` to preview locally, or use a local HTTP server. Its portfolio card links here.

## Source and build

- `../todo_terrarium.tsx`: canonical app source, including local task persistence.
- `main.tsx`: React entry point.
- `styles.css`: Tailwind source and small accessibility/mobile adjustments.
- `assets/`: generated, self-contained browser files. **Commit these files** with source changes so GitHub Pages can serve the app without a server-side build.

To rebuild after editing the source, run from the repository root:

```sh
npm ci --prefix todo-terrarium
npm run --prefix todo-terrarium build
```

Then preview, commit the source and generated assets, and publish using the existing GitHub Desktop workflow. Do not commit `node_modules`.

## Visitor data

Tasks and notes use the `todo-terrarium.tasks.v1` localStorage key. They stay in the visitor's browser, survive reloads, and are not sent to a server. They do not sync between devices. Clearing browser/site data removes them; private browsing may not retain them. Preview and published-site storage are separate.

## Interaction checks

Create a task; select its type; double-tap its creature (or focus it and press Enter); write notes; reload; release it; verify the notes in Memory Meadow after another reload. Check the invitation dialog at narrow phone widths and close it with Escape. Reduced-motion preferences stop creature wandering and decorative animations.
