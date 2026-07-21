'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { SproutWordmark } from '@/components/layout/sprout-wordmark';
import { Progress } from '@/components/ui/progress';
import { StepEntityPurpose } from '@/components/intake/step-entity-purpose';
import { StepEntrePassEvidence } from '@/components/intake/step-entrepass-evidence';
import { StepHomeCountry } from '@/components/intake/step-home-country';
import { StepIndustry } from '@/components/intake/step-industry';
import { StepTeamRevenue } from '@/components/intake/step-team-revenue';
import { ProfileSchema } from '@/lib/schemas';
import { useProfileStore } from '@/store/use-profile-store';

const stepCount = 5;

const fieldStep: Record<string, number> = {
  homeCountry: 1,
  industry: 2,
  entityPurpose: 3,
  foundersRelocating: 4,
  staffRelocating: 4,
  projectedSingaporeRevenue: 4,
  entrePassEvidence: 5,
};

export function WizardShell() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const draft = useProfileStore((state) => state.draftProfile);
  const patchDraft = useProfileStore((state) => state.patchDraft);
  const setProfile = useProfileStore((state) => state.setProfile);
  const [direction, setDirection] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function advance() {
    setSubmitError(null);
    setDirection(1);
    setStep((current) => Math.min(current + 1, stepCount));
  }
  function back() {
    setSubmitError(null);
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 1));
  }
  function finish(values: {
    entrePassEvidence: NonNullable<typeof draft.entrePassEvidence>;
  }) {
    const completeDraft = {
      ...draft,
      ...values,
      entrePassEvidence: {
        ...draft.entrePassEvidence,
        ...values.entrePassEvidence,
      },
    };
    patchDraft(values);
    const result = ProfileSchema.safeParse(completeDraft);
    if (!result.success) {
      const firstInvalidField = Object.keys(
        result.error.flatten().fieldErrors,
      )[0];
      const targetStep = firstInvalidField
        ? (fieldStep[firstInvalidField] ?? 1)
        : 1;
      setSubmitError(
        'Some earlier answers still need attention. Please review the highlighted step.',
      );
      if (targetStep !== step) {
        setDirection(targetStep < step ? -1 : 1);
        setStep(targetStep);
      }
      return;
    }
    setProfile(result.data);
    router.push('/playbook');
  }
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: (value: number) => ({ opacity: 0, x: value * 24 }),
        animate: { opacity: 1, x: 0 },
        exit: (value: number) => ({ opacity: 0, x: value * -24 }),
      };
  const transition = { duration: 0.22, ease: 'easeOut' as const };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <SproutWordmark />
          <Link
            className="text-[13px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-primary"
            href="/"
          >
            Exit to landing
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-xl px-6 py-10 sm:py-16">
        <p className="font-mono text-[12.5px] font-medium tracking-[0.08em] text-primary uppercase">
          Sprout intake
        </p>
        <h1 className="mt-3 font-serif text-[32px] font-semibold tracking-[-0.02em] text-foreground">
          Build your Singapore entry plan.
        </h1>
        <div className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-center justify-between font-mono text-[12.5px] font-medium text-muted-foreground">
            <span>
              Step {step} of {stepCount}
            </span>
            <span className="tabular-nums">{step * 20}% complete</span>
          </div>
          <Progress
            aria-label={`Step ${step} of ${stepCount}`}
            className="mt-3"
            value={step * 20}
          />
          {submitError ? (
            <p
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
          <div className="mt-8 -mx-2 overflow-hidden px-2">
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.div
                animate="animate"
                custom={direction}
                exit="exit"
                initial="initial"
                key={step}
                transition={transition}
                variants={variants}
              >
                {step === 1 && (
                  <StepHomeCountry
                    draft={draft}
                    onValid={(values) => {
                      patchDraft(values);
                      advance();
                    }}
                  />
                )}
                {step === 2 && (
                  <StepIndustry
                    draft={draft}
                    onBack={back}
                    onValid={(values) => {
                      patchDraft(values);
                      advance();
                    }}
                  />
                )}
                {step === 3 && (
                  <StepEntityPurpose
                    draft={draft}
                    onBack={back}
                    onValid={(values) => {
                      patchDraft(values);
                      advance();
                    }}
                  />
                )}
                {step === 4 && (
                  <StepTeamRevenue
                    draft={draft}
                    onBack={back}
                    onValid={(values) => {
                      patchDraft(values);
                      advance();
                    }}
                  />
                )}
                {step === 5 && (
                  <StepEntrePassEvidence
                    draft={draft}
                    onBack={back}
                    onClearDetail={(detailKey) =>
                      patchDraft({
                        entrePassEvidence: { [detailKey]: undefined },
                      })
                    }
                    onValid={finish}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
          General information, not legal advice.
        </p>
      </div>
    </main>
  );
}
