'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { EntrePassEvidenceSchema } from '@/lib/schemas';
import { type DraftProfile } from '@/store/use-profile-store';

const stepSchema = z.object({ entrePassEvidence: EntrePassEvidenceSchema });
type StepValues = z.infer<typeof stepSchema>;
type EvidenceKey = 'hasVcBacking' | 'hasIp' | 'hasTrackRecord';
type DetailKey = 'vcBackingDetails' | 'ipDetails' | 'trackRecordDetails';
type EvidenceItem = {
  booleanKey: EvidenceKey;
  detailKey: DetailKey;
  title: string;
  question: string;
};
const evidenceItems: EvidenceItem[] = [
  {
    booleanKey: 'hasVcBacking',
    detailKey: 'vcBackingDetails',
    title: 'VC backing',
    question: 'Do you have qualifying VC backing?',
  },
  {
    booleanKey: 'hasIp',
    detailKey: 'ipDetails',
    title: 'Intellectual property',
    question: 'Do you have qualifying intellectual property?',
  },
  {
    booleanKey: 'hasTrackRecord',
    detailKey: 'trackRecordDetails',
    title: 'Track record',
    question: 'Do you have a qualifying entrepreneurial track record?',
  },
];
type StepEntrePassEvidenceProps = {
  draft: DraftProfile;
  onBack: () => void;
  onValid: (values: StepValues) => void;
  onClearDetail: (detailKey: DetailKey) => void;
};

export function StepEntrePassEvidence({
  draft,
  onBack,
  onValid,
  onClearDetail,
}: StepEntrePassEvidenceProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      entrePassEvidence: {
        hasVcBacking: draft.entrePassEvidence?.hasVcBacking ?? false,
        vcBackingDetails: draft.entrePassEvidence?.vcBackingDetails,
        hasIp: draft.entrePassEvidence?.hasIp ?? false,
        ipDetails: draft.entrePassEvidence?.ipDetails,
        hasTrackRecord: draft.entrePassEvidence?.hasTrackRecord ?? false,
        trackRecordDetails: draft.entrePassEvidence?.trackRecordDetails,
      },
    },
  });
  const evidence = useWatch({ control, name: 'entrePassEvidence' });
  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset>
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          What supports your EntrePass eligibility?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Answer each question. Details are optional, but help you review your
          evidence later.
        </p>
        <div className="mt-6 space-y-5">
          {evidenceItems.map((item) => {
            const isYes = evidence?.[item.booleanKey] ?? false;
            const choiceError =
              errors.entrePassEvidence?.[item.booleanKey]?.message;
            const detailError =
              errors.entrePassEvidence?.[item.detailKey]?.message;
            return (
              <div
                className="rounded-xl border border-border bg-card p-4"
                key={item.booleanKey}
              >
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-foreground">{item.question}</p>
                <div
                  className="mt-3 flex gap-3"
                  role="radiogroup"
                  aria-label={item.question}
                >
                  <Controller
                    control={control}
                    name={`entrePassEvidence.${item.booleanKey}`}
                    render={({ field }) => (
                      <>
                        <label className="cursor-pointer">
                          <input
                            checked={field.value === true}
                            className="peer sr-only"
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={() => field.onChange(true)}
                            ref={field.ref}
                            type="radio"
                          />
                          <span className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-primary">
                            Yes
                          </span>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            checked={field.value === false}
                            className="peer sr-only"
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={() => {
                              field.onChange(false);
                              setValue(
                                `entrePassEvidence.${item.detailKey}`,
                                undefined,
                                { shouldDirty: true },
                              );
                              onClearDetail(item.detailKey);
                            }}
                            type="radio"
                          />
                          <span className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-primary">
                            No
                          </span>
                        </label>
                      </>
                    )}
                  />
                </div>
                {choiceError && (
                  <p className="mt-2 text-[12.5px] text-destructive" role="alert">
                    {choiceError}
                  </p>
                )}
                {isYes && (
                  <label className="mt-4 block text-sm font-medium text-foreground">
                    Supporting details
                    <textarea
                      aria-invalid={Boolean(detailError)}
                      className="mt-2 min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
                      maxLength={500}
                      {...register(`entrePassEvidence.${item.detailKey}`, {
                        setValueAs: (value) =>
                          typeof value === 'string' && value.trim() === ''
                            ? undefined
                            : value,
                      })}
                    />
                    <span className="mt-1.5 block font-mono text-[12.5px] font-normal text-muted-foreground">
                      Do not include links or file references.
                    </span>
                  </label>
                )}
                {detailError && (
                  <p className="mt-2 text-[12.5px] text-destructive" role="alert">
                    {detailError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button
          className="border-border bg-card text-foreground hover:bg-muted"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Back
        </Button>
        <Button
          className="h-10 bg-foreground px-4 text-background hover:bg-foreground/90"
          type="submit"
        >
          Generate playbook
        </Button>
      </div>
    </form>
  );
}
