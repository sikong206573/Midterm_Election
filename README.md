# 2026 Election Atlas / 中期选举观察

A buildless, bilingual-label election dashboard for GitHub Pages. Includes all 50 states and DC, 35 Senate races and 36 gubernatorial races in the November 3, 2026 source roster. Does not include House district races.

## Use

The `Publish election atlas` workflow deploys this repository. If GitHub reports Pages is not enabled, open **Settings → Pages → Build and deployment → Source → GitHub Actions**, then rerun the failed workflow. No API keys, server login or paid service required.

Hover a state to preview candidates; click to pin, Escape to unpin. The state selector works on touch devices. Switch Senate/Governor above the map. Live reads refresh every 60 seconds while the page is visible. The initial committed snapshot is a fallback; timestamps are shown for every race. A failed read never becomes a zero-vote or completed race.

## Semantics

- Blue/red: Democratic/Republican leading candidate (or source-declared winner). Intensity is the first–second vote-share margin. Purple: other party or tie. Gray: no votes / no verified data.
- Green solid border: civicAPI declares a winner. Gold dashed border: no winner declared. These are **provider projections, not official certification**.
- Shares use every candidate's reported vote count in the full race response. Before any votes, shares show `—`, not misleading 0% results.
- Stats count only the current year's loaded contests, not total chamber membership.
- No invented results or portraits. `test_data` must explicitly be false. Date, country and state must match the verified race roster.
- Candidate photographs are matched by name and seat using watch.vote's verified portrait endpoint. Unavailable photos remain visibly missing. Credits and licenses are preserved in `data/portraits.json`.
- A missing contest does not prove there is no election. The roster is fixed to November 3; later runoffs require explicit roster updates. Ranked-choice rounds follow the provider's current published totals.

## Sources and maintenance

Results and calls: [civicAPI](https://civicapi.org/api-documentation), [methodology](https://civicapi.org/faq). Map geometry: [us-atlas](https://github.com/topojson/us-atlas), ISC licensed, Census-derived Albers US projection. Portrait directory: [watch.vote](https://watch.vote/docs/api-reference/elections), with original attribution stored per photo.

`python scripts/refresh.py` updates the fallback snapshot. `python scripts/portraits.py` refreshes verified portraits. Both use Python's standard library and curl. The manual `Refresh saved results` action commits a new snapshot; GitHub does not trigger a separate push workflow for bot commits, so run `Publish election atlas` manually afterwards. Live browser polling is independent of snapshots and GitHub Actions.

No build step. Serve the repository with a static HTTP server for local development. Browser requests need connectivity to civicapi.org; portrait hosting depends on the original photo source. Review per-race retrieval times during outages.
