import Link from 'next/link';

export default function IntakePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6">
      <div>
        <p className="text-[12.5px] font-medium tracking-[0.08em] text-teal-700 uppercase">
          SingaPath intake
        </p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
          Your five-minute playbook starts here.
        </h1>
        <p className="mt-3 text-[14.5px] leading-6 text-zinc-700">
          The multi-step intake is the next product milestone. You can load a
          mock profile from the landing page in the meantime.
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
