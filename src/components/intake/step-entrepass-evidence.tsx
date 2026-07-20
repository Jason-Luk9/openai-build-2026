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
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          What supports your EntrePass eligibility?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
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
                className="rounded-xl border border-zinc-200 bg-white p-4"
                key={item.booleanKey}
              >
                <p className="text-sm font-semibold text-zinc-900">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-zinc-700">{item.question}</p>
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
                          <span className="inline-flex rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-teal-700">
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
                          <span className="inline-flex rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-teal-700">
                            No
                          </span>
                        </label>
                      </>
                    )}
                  />
                </div>
                {choiceError && (
                  <p className="mt-2 text-[12.5px] text-red-600" role="alert">
                    {choiceError}
                  </p>
                )}
                {isYes && (
                  <label className="mt-4 block text-sm font-medium text-zinc-800">
                    Supporting details
                    <textarea
                      aria-invalid={Boolean(detailError)}
                      className="mt-2 min-h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:border-teal-700 focus-visible:ring-3 focus-visible:ring-teal-700/25"
                      maxLength={500}
                      {...register(`entrePassEvidence.${item.detailKey}`, {
                        setValueAs: (value) =>
                          typeof value === 'string' && value.trim() === ''
                            ? undefined
                            : value,
                      })}
                    />
                    <span className="mt-1.5 block text-[12.5px] font-normal text-zinc-500">
                      Do not include links or file references.
                    </span>
                  </label>
                )}
                {detailError && (
                  <p className="mt-2 text-[12.5px] text-red-600" role="alert">
                    {detailError}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button onClick={onBack} type="button" variant="outline">
          Back
        </Button>
        <Button
          className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"
          type="submit"
        >
          Generate playbook
        </Button>
      </div>
    </form>
  );
}
