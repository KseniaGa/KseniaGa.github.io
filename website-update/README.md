# Updating your website

## First setup

1. In GitHub Desktop, select your website repository and use **Repository → Show in Explorer**.
2. Save a backup of your existing `index.html` outside the repository.
3. Copy these four files from this package into the repository's main folder: `index.html`, `style.css`, `script.js`, and `content.js`. Replace the old `index.html`.
4. Keep your existing `images` folder beside those files. Images are not included in this package.
5. Double-click `index.html` to preview it. Check the Research, Games, and Academy tabs.
6. In GitHub Desktop, review the changes, enter a summary such as “Make website content easier to update”, commit, and click **Push origin** when ready to publish.

No installation, build command, or local server is needed. Your existing GitHub Pages publishing setup can stay as it is.

## Everyday changes

Open **content.js** in your text editor. It contains:

- `publications`: grouped into `storytelling`, `catharsis`, `ethicalTech`, and `criticalStudies`.
- `games`: game cards, descriptions, tags, image paths, and links.
- `teaching`: course cards, semester tags, descriptions, and optional links.

Edit an existing entry, or copy a whole entry from its opening `{` through its closing `}` to add another. Separate entries with commas. Their order in the file is their display order.

Example publication (replace the example text before using):

```js
{
  "title": "Your paper title",
  "venue": "Conference or journal",
  "year": 2026,
  "status": "Published",
  "link": "https://example.com/paper"
}
```

Use `"status": ""` to omit the status and `"link": ""` when no public link is available. A double quote within text must be escaped: `"title": "\"Quoted phrase\": subtitle"`. Apostrophes, emojis, and curly quotation marks can be typed normally. Keep the file saved as UTF-8.

For games, put new images in `images` and enter the matching path, including the correct uppercase/lowercase letters. `imageAlt` describes the image; `imageFallback` can be left empty. Course `link` fields are optional; existing decorative labels have been preserved.

After editing: save → refresh your local preview → review in GitHub Desktop → commit → push when ready.

## Where other changes live

- `index.html`: bio, active missions, GIRT, talks, layout, and reusable card templates.
- `style.css`: colours, typography, and layout rules.
- `script.js`: content rendering and the existing interactive features.

This refactor preserves the existing content. Publication statuses and teaching dates have not been updated or independently checked.

## If something looks wrong

- Empty cards or a content warning: check commas, quotation marks, and brackets in `content.js`.
- Missing styling or content: all four files must be in the same folder.
- Missing images: retain your original `images` folder and check filenames.
- Online version still old: allow the existing GitHub Pages deployment to finish, then refresh.

You can also bring back `content.js` with a rough note about what happened, and ask for the relevant entries plus an optional social post draft.
