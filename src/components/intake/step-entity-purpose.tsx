'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ProfileSchema } from '@/lib/schemas';
import { type DraftProfile } from '@/store/use-profile-store';

const stepSchema = ProfileSchema.pick({ entityPurpose: true });
type StepValues = z.infer<typeof stepSchema>;
const purposes = [
  ['local-operations', 'Run local operations'],
  ['regional-hq', 'Lead a regional headquarters'],
  ['holding-investment', 'Hold investments or assets'],
  ['rd-ip-hub', 'Build R&D and IP'],
] as const;
type StepEntityPurposeProps = {
  draft: DraftProfile;
  onBack: () => void;
  onValid: (values: StepValues) => void;
};
export function StepEntityPurpose({
  draft,
  onBack,
  onValid,
}: StepEntityPurposeProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { entityPurpose: draft.entityPurpose },
  });
  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset>
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          What will your Singapore entity do?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Choose its primary purpose.
        </p>
        <div className="mt-6 grid gap-3">
          {purposes.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('entityPurpose')}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-teal-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.entityPurpose && (
          <p className="mt-3 text-[12.5px] text-red-600" role="alert">
            {errors.entityPurpose.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-between">
        <Button onClick={onBack} type="button" variant="outline">
          Back
        </Button>
        <Button
          className="h-10 bg-teal-700 px-4 text-white hover:bg-teal-800"
          type="submit"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
