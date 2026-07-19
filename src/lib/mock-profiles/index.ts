/**
 * Bundled mock profiles for `?demo=1` loading. Each JSON file is parsed
 * against `ProfileSchema` at import time (same pattern as `bundledKnowledge`
 * in `src/lib/schemas.ts`), so a malformed fixture throws immediately.
 *
 * The keys here are the stable profile identifiers used everywhere a demo
 * profile needs to be referenced: as the `?demo=1&profile=<id>` query value,
 * as the matching filename in `src/lib/mock-profiles/<id>.json` and
 * `src/lib/fixtures/<id>.json`, and as the union type `MockProfileId`. Do
 * not rename these ids without updating both JSON directories together.
 */
import { ProfileSchema, type Profile } from "@/lib/schemas";

import payflipJson from "./payflip.json";
import vietstackJson from "./vietstack.json";
import warungDigitalJson from "./warung-digital.json";

export const mockProfiles = {
  "warung-digital": ProfileSchema.parse(warungDigitalJson),
  vietstack: ProfileSchema.parse(vietstackJson),
  payflip: ProfileSchema.parse(payflipJson),
} satisfies Record<string, Profile>;

export type MockProfileId = keyof typeof mockProfiles;

export const mockProfileIds = Object.keys(mockProfiles) as MockProfileId[];
