'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import payflip from '@/lib/mock-profiles/payflip.json';
import vietstack from '@/lib/mock-profiles/vietstack.json';
import warungDigital from '@/lib/mock-profiles/warung-digital.json';
import { ProfileSchema, type Profile } from '@/lib/schemas';

const mockProfiles = {
  'warung-digital': ProfileSchema.parse(warungDigital),
  vietstack: ProfileSchema.parse(vietstack),
  payflip: ProfileSchema.parse(payflip),
} satisfies Record<string, Profile>;

export type MockProfileId = keyof typeof mockProfiles;

type ProfileState = {
  profile: Profile | null;
  mockProfileId: MockProfileId | null;
  loadMockProfile: (id: MockProfileId) => void;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      mockProfileId: null,
      loadMockProfile: (id) => {
        set({ profile: mockProfiles[id], mockProfileId: id });
      },
      setProfile: (profile) => set({ profile, mockProfileId: null }),
      clearProfile: () => set({ profile: null, mockProfileId: null }),
    }),
    {
      name: 'singapath-profile',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
