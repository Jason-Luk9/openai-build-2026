'use client';

import Link from 'next/link';

import { useProfileStore } from '@/store/use-profile-store';

export default function PlaybookPage() {
  const profile = useProfileStore((state) => state.profile);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6">
      <div>
        <p className="text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
          Your playbook
        </p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
          {profile ? 'Profile loaded.' : 'No profile loaded yet.'}
        </h1>
        <p className="mt-3 max-w-xl text-[14.5px] leading-6 text-zinc-700">
          {profile
            ? 'The facts-backed playbook dashboard will use this saved profile in the next milestone.'
            : 'Choose a mock profile from the landing page to begin.'}
        </p>
        <Link
          className="mt-6 inline-flex rounded-md text-sm font-semibold text-teal-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          href="/"
        >
          Back to SingaPath
        </Link>
      </div>
    </main>
  );
}
