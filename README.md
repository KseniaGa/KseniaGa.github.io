# Updating your website

## Preview and publish

1. Edit the `content.js` in the repository's main folder (beside this README). The `website-update` folder and ZIP are an older package, not the live site's source.
2. Double-click the main folder's `index.html` to preview it. Check all eight tabs.
3. In GitHub Desktop, review your changes, commit, and click **Push origin** when ready to publish.

No installation, build command, or local server is needed. Your existing GitHub Pages publishing setup can stay as it is.

## Everyday changes

Open **content.js** in your text editor. It contains:

- `profile`: bio, name, portrait, contact links, and rotating welcome/theme messages.
- `research`: introductory text, photo, and the three research themes.
- `communityEvent`: workshop title, description, status, and poster.
- `guild`: GIRT description, contact, community statistics, activities, and symposium/zine details.
- `fieldNotes`: news, papers, games, workshops, talks, and interviews. The homepage and archive share this list.
- `gamesIntro`, `teachingIntro`, `teachingImage`, and `teachingImageAlt`: section introductions and teaching photo.
- `publications`: selected game studies/HCI publications, each with a `topics` list matching one or more research themes.
- `additionalPublications`: other computing research, shown in an expandable section.
- `games`: game cards, descriptions, tags, image paths, and links.
- `teaching`: course cards, semester tags, descriptions, and optional links.

Edit an existing entry, or copy a whole entry from its opening `{` through its closing `}` to add another. Separate entries with commas. Their order in the file is their display order, except Field Notes, which sorts newest first.

For a bio update, change only the text after `"bio":` near the top. You can also ask Codex, for example: “Update my bio to …” or “Add this talk with this title and link …”. All ordinary content updates belong in this file; a form editor is not required.

Text fields are plain text, so do not insert HTML tags. The community event description uses text parts with optional `"bold": true` to preserve its emphasis. Link entries with `"newTab": true` open in a new tab. Empty Field Notes/contact-list links hide their buttons. Lists can be extended or shortened by adding/removing whole entries.

`profile.pageTitle` and `profile.searchDescription` update browser metadata when JavaScript runs. `index.html` retains fallback metadata for readers that do not run JavaScript; update those two fallback values too if changing search-preview wording.

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

- `index.html`: layout, fixed interface labels, fallback metadata, and reusable card templates.
- `style.css`: colours, typography, and layout rules.
- `script.js`: content rendering and the existing interactive features.
- `field-notes.js`: date sorting, homepage notes, archive year filters, and the recordings-only Watch & Listen view.
- `publications.js`: research themes, chronological bibliography, and topic filters.

Research wording and selected publication statuses were updated from the thesis description and extension application supplied in October 2026. Accepted and planned work remains labelled as such.

## If something looks wrong

- Empty cards or a content warning: check commas, quotation marks, and brackets in `content.js`.
- Missing styling or content: keep index.html, content.js, script.js, field-notes.js, publications.js, and style.css together.
- Missing images: retain your original `images` folder and check filenames.
- Online version still old: allow the existing GitHub Pages deployment to finish, then refresh.

You can also bring back `content.js` with a rough note about what happened, and ask for the relevant entries plus an optional social post draft.

## Project collection

`projects` contains the tools and research prototypes. Set `featured` to `true` to show a project on Profile. Each entry has a title, category, status, description, longer details, icon, colour theme, and optional launch link. Leave `link` empty for an overview without a playable version. Insider Out currently uses this option. Todo Terrarium now has a browser app at `todo-terrarium/`; its canonical source is `todo_terrarium.tsx`.

GIRT's website link is in `guild.website`. The past TYS workshop link is in `communityEvent.link`. Dungeons & Drafting is also linked from its Scientific Writing course entry.

Profile's introductory role and section wording are in `profile`. Branch Beetle is the featured project on Profile. Insider Out, Dungeons & Drafting, and Todo Terrarium remain in the separate Projects tab; Insider Out is also highlighted in Research, and Dungeons & Drafting is linked from Academy. Project Galaxy, Professor Ribbit, and TindR&R are not listed.

## Page design and navigation

Projects (`#projects`) and Games (`#games`) are separate views with their own dock buttons. Profile features Branch Beetle with a direct launch link. Research uses native expandable publication lists, a Sims 2-inspired knowledge panel, and a separate workshop archive. GIRT’s website is the primary action in its welcome panel. Small credits identify the game inspirations; Projects uses a LittleBigPlanet-inspired paper-and-fabric workshop theme. Talks retains its Vampire: The Masquerade – Bloodlines theme at #chronicles; Field Notes has its own journal at #field-notes.

Selected publications are listed by year with topic filters. Other computing publications can be expanded separately. Each entry displays a separate title, venue/year/status line, and optional reading link. The current RepCon course uses a CURRENT TEACHING label; update this in `teaching` when it changes. The newest game uses the local `images/game-1.png` cover, displayed without cropping.

## Accessibility and pending content

The header's Effects control disables particles, typewriter animation, and achievement/level-up pop-ups. Its setting is saved locally when browser storage is available; without a saved setting it respects reduced-motion preferences. Pet controls are native buttons, usable with Tab and Enter/Space. The mobile dock has two rows and reserved bottom space.

Branch Beetle uses `images/story-tree.png` as its main screenshot. Its `screenshots` list supplies additional captioned images on Projects, each opening at full size. Profile uses Field Notes for dated updates; the overlapping Current Work section has been removed. Research methods are in `research.methods`.

## Todo Terrarium

The Projects tab now links to the working app in `todo-terrarium/`. Its built assets are included for GitHub Pages. See `todo-terrarium/README.md` for rebuilding after source changes. Tasks and notes are saved in each visitor’s browser, without device syncing.

## Dungeons & Drafting

Launch the writing game from Projects or its Scientific Writing teaching entry. It saves one adventure in the current browser, including the paper plan, research method, and section drafts. Choose Resume Adventure to continue. Starting over asks before replacing the saved adventure. Download TXT or HTML from the manuscript view for a separate backup; browser progress does not sync between devices and is lost if browser storage is cleared.

The game uses `dungeons_drafting.html`, `dungeons-drafting.css`, and `dungeons-drafting.js` together, with no build step. Publish all three through the normal GitHub Pages workflow. The revision stage remains the original teaser.

## Field Notes

Add an entry once in `content.js` under `fieldNotes`. Give it a unique `id`, a `date`, `category`, `title`, `description`, and optional `link` and `linkLabel`. Use dates such as `2026-09-20`, `2026-09`, or `2026`; leave the date empty if unknown. An optional `dateLabel` can display an event range. Never invent exact dates to fill the archive.

The newest three dated entries appear on Profile; every entry stays in the archive, grouped by year. Within the same year, entries with exact dates appear before entries with only a year; ties retain their order in the content file. Undated entries come last. Year buttons are generated from the entry dates automatically, with older and undated entries retained. All activities stay in Field Notes. Only entries with `recording: {kind: "Video", link: "https://…"}` or `recording: {kind: "Audio", link: "https://…"}` appear on Watch & Listen. A talk with only a schedule, paper, or slides link does not appear there.

Branch Beetle opens Projects in a full-width section, with its research context in `sections` and its captioned images in `screenshots`. Other projects remain below it. The source PDFs were used for wording only and were not copied into the public website.

## Content organisation

Profile keeps the introduction, Branch Beetle, and latest Field Notes; awards and Current Work have been removed. Watch & Listen remains at `#chronicles` with the vampire theme, showing recordings only. Field Notes at `#field-notes` keeps all activities. Teaching is labelled Teaching throughout while keeping the Undertale design and the existing `#academy` address.

Research separates three theme summaries from one year-sorted publication list. A publication may have multiple topics but appears only once in All. Legacy `#pubs-story`, `#pubs-catharsis`, `#pubs-ai`, and `#pubs-crit` links lead to the bibliography. ORCID was checked in October 2026; Google Scholar blocked automated access. Earlier computing research is available under Other computing research.

`guild.jam` describes the 2026 jam and links to all submissions. GIRT wording follows the community website; unverified membership counts were removed. Game images use contain sizing and never zoom on hover so the complete art remains visible.

## Merged research navigation

Research now contains TYS, its linked publications (`project: "tys"`), Branch Beetle, Insider Out, and the selected bibliography. Projects no longer has a separate dock page; old `#projects` links redirect to Research. Dungeons & Drafting lives under Teaching; Todo Terrarium under Games. Field Notes is opened with View archive on Profile, without a dock button. The six dock pages retain their distinct visual themes.

The publication list initially shows five entries, sorted newest year first. Show all publications expands the active topic filter; Show recent publications collapses it. TYS references are drawn from the same publication records.
## Compact project presentation

Todo Terrarium and Insider Out are rendered with the same game-card template as the games, using their entries in `projects` as the source. Insider Out remains labelled as a prototype without a playable link. Add `image` and `imageAlt` to either project to supply a screenshot. Dungeons & Drafting stays under Teaching; its project card also accepts those image fields. Screenshots have not been invented or substituted.

The Teaching photo is removed from the page. GIRT's Community Board and Town Activities panels are removed; the jam keeps the pinned-note treatment. Research keeps the main introductions and links visible, with themes, workshop details, TYS publications, and Branch Beetle's research context/gallery in native expandable sections.

## Current course and featured teaching tool

Set `current: true` on the current course to show it full width. Its tags include the semester and its optional `link`/`buttonLabel` provide course information. Previous courses sit underneath. Dungeons & Drafting has one feature with its captured planning screenshot, one description, and one launch button. `supervision` supplies the compact mentoring section.

Home shows Field Notes before Branch Beetle, framed with pink and turquoise secret-agent details. A game's optional `ribbon` field adds its small release label. GIRT uses `images/girt_logo.png` and `images/girtjam_submissions.png`; the latter opens at full size and the jam button links to playable submissions.
