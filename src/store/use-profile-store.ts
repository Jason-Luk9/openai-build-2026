'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockProfiles, type MockProfileId } from '@/lib/mock-profiles';
import type { Profile } from '@/lib/schemas';

export type { MockProfileId };

export type DraftProfile = Partial<Omit<Profile, 'entrePassEvidence'>> & {
  entrePassEvidence?: Partial<Profile['entrePassEvidence']>;
};

type ProfileState = {
  profile: Profile | null;
  draftProfile: DraftProfile;
  mockProfileId: MockProfileId | null;
  loadMockProfile: (id: MockProfileId) => void;
  patchDraft: (patch: DraftProfile) => void;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      draftProfile: {},
      mockProfileId: null,
      loadMockProfile: (id) => {
        const profile = mockProfiles[id];
        set({ profile, draftProfile: profile, mockProfileId: id });
      },
      patchDraft: (patch) =>
        set((state) => ({
          draftProfile: {
            ...state.draftProfile,
            ...patch,
            entrePassEvidence: {
              ...state.draftProfile.entrePassEvidence,
              ...patch.entrePassEvidence,
            },
          },
        })),
      setProfile: (profile) => set({ profile, mockProfileId: null }),
      clearProfile: () =>
        set({ profile: null, draftProfile: {}, mockProfileId: null }),
    }),
    {
      name: 'singapath-profile',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
