# Install Story Order

## Most users

1. Open https://stremio-story-order.storyorder.workers.dev/configure
2. Leave **Cinemeta** selected.
3. Leave **Safe** selected.
4. Click **Create install link**.
5. Click **Install Story Order** and approve it in Stremio.

Keep your existing stream addons such as Torrentio, AIOStreams or Maelstrom. Story Order does not replace them.

## What happens next

Open TV series normally in Stremio. Story Order changes the episode list Stremio sees so supported specials, one-offs and misplaced episodes can appear in the correct watch order. There is no separate player and nothing else to start.

## Already using AIOMetadata?

On the Configure page, choose **AIOMetadata** and paste your configured AIOMetadata manifest URL. Story Order then uses that metadata and fixes its episode ordering.

For the corrected metadata to take priority, Story Order should be ahead of the metadata addon it wraps, or you can remove the duplicate original metadata addon after confirming Story Order works. Your stream addons do not need to move.

## Want more control?

The default **Safe** profile is recommended. **Balanced**, **Complete story** and **Custom** can include more short-form material or manual per-series overrides. Short-form entries are more likely to have no playable stream, so only enable them when you want that behaviour.
