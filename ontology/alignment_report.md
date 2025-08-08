# Ontology/CDM Alignment Report (Deterministic MVP)

Base Ontology: Defense Core v0.1.0

CDM: Common Data Model v0.1.0

Sources: Link-16 (curated), VMF (curated)

## Coverage Summary

- CDM entities: 7 (Unit, Track, Message, Position, Time, Platform, Link)
- Link-16 mapping covers: Track, Message, Position, Time, Link (5/7)
- VMF mapping covers: Track, Message, Position, Time, Link (5/7)
- Shared coverage (intersection): Track, Message, Position, Time, Link (5/7)
- Missing in both: Unit, Platform (2/7)
- Coverage %: 5 / 7 = 71%

## Conflicts and Resolutions

- [LOW] Timestamp granularity: JMessage.timestampMs → Time.epochMs (precision verified) – RESOLVED
- [LOW] Naming: VMF kSeries → Message.messageType (alias) – RESOLVED

## Mapping Decisions

- Track identifiers: Link-16 `trackNumber` and VMF `trackId` → CDM `Track.trackId`
- Position components: lat/lon/alt map directly for both Link-16 and VMF
- Link name normalization: Link-16 `JTacticalDataLink.name` and VMF `VMFLink.name` → CDM `Link.name`

## Next Steps (Post-MVP)

- Incorporate `Unit` and `Platform` from authoritative registries
- Add provenance fields to mappings (source doc, paragraph refs)
- Extend relations coverage (belongsToUnit, emitsMessage concrete paths)

