# Cross title Story Order contract

Story Order may eventually need to place a separate film, TV movie or related title at a point inside a series narrative.

That must not be implemented by inserting the external title into the series canonical video array.

A film and a series episode can use different Stremio resource types and stream identities. Treating a film as though it were a series video can make stream addons receive the wrong media type and can corrupt watched or Continue Watching identity.

## Candidate representation

The reserved candidate contract is additive presentation metadata.

```json
{
  "behaviorHints": {
    "storyReferencesVersion": 1,
    "storyReferences": [
      {
        "type": "movie",
        "metaId": "tt7654321",
        "videoId": "tt7654321",
        "afterId": "tt1234567:2:4",
        "label": "The Story Film"
      }
    ]
  }
}
```

Story Order does not emit this hint in production yet.

## Required invariants

A compatible client must treat every reference as a navigation boundary rather than as a member of the parent series video list.

1. The parent series canonical `videos` array is unchanged.
2. The referenced item keeps its own `type`, `metaId` and optional `videoId`.
3. Exactly one parent anchor is supplied through `beforeId` or `afterId`.
4. The anchor exists in the parent canonical video array.
5. Duplicate cross title references fail closed.
6. Unsupported media types fail closed.
7. Watched state belongs to the referenced title, never to a synthetic parent episode.
8. Stream resolution uses the referenced title's actual media type and identity.
9. Continue Watching remains owned by the referenced title's canonical LibraryItem.
10. Clients that do not support the contract ignore it safely.
11. Automatic autoplay across the title boundary is disabled unless the client explicitly supports a media type switch.
12. Returning to the parent story resumes at the next stable parent video ID, not a renumbered synthetic episode.

## Client presentation

A compatible client may render a referenced title as an inline narrative card between parent episodes.

Selecting the card navigates to or plays the external title using its own canonical identity.

After external playback completes, a client with explicit cross title continuation support may offer to return to the next parent story item.

The parent series watched bitmap must never gain a bit for the external title.

## Fail closed cases

Use ordinary Story Order presentation and ignore all cross title references if

- `storyReferencesVersion` is not exactly `1`
- the references value is malformed
- an anchor is unknown
- a reference supplies both before and after anchors
- a reference supplies neither anchor
- the target media type is unsupported
- the target metadata identity is missing
- a duplicate target and placement pair is present

Invalid cross title metadata must never hide or reorder canonical parent episodes.

## Release gate

Production Story Order must not publish `storyReferences` until at least one Stremio client proves

- correct target type stream lookup
- watched state isolation
- Continue Watching isolation
- manual navigation back to the parent sequence
- safe behaviour when the referenced target is unavailable
- safe behaviour on clients that ignore the hint

The executable reference in this repository validates the data contract only. It does not activate the feature.
