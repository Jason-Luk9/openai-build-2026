'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/format';
import { ProfileSchema } from '@/lib/schemas';
import { type DraftProfile } from '@/store/use-profile-store';

const stepSchema = ProfileSchema.pick({
  foundersRelocating: true,
  staffRelocating: true,
  projectedSingaporeRevenue: true,
});
type StepValues = z.infer<typeof stepSchema>;
type StepTeamRevenueProps = {
  draft: DraftProfile;
  onBack: () => void;
  onValid: (values: StepValues) => void;
};

const fieldClass =
  'mt-2 h-10 border-zinc-300 bg-white focus-visible:border-teal-700 focus-visible:ring-teal-700/25';

export function StepTeamRevenue({
  draft,
  onBack,
  onValid,
}: StepTeamRevenueProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      foundersRelocating: draft.foundersRelocating,
      staffRelocating: draft.staffRelocating,
      projectedSingaporeRevenue: draft.projectedSingaporeRevenue,
    },
  });
  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset>
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          Who is moving, and what will you earn?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Use your best first-year estimate for Singapore revenue.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-800">
            Founders relocating
            <input
              aria-invalid={Boolean(errors.foundersRelocating)}
              className={fieldClass}
              min="0"
              step="1"
              type="number"
              {...register('foundersRelocating', { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm font-medium text-zinc-800">
            Staff relocating
            <input
              aria-invalid={Boolean(errors.staffRelocating)}
              className={fieldClass}
              min="0"
              step="1"
              type="number"
              {...register('staffRelocating', { valueAsNumber: true })}
            />
          </label>
        </div>
        {errors.foundersRelocating && (
          <p className="mt-2 text-[12.5px] text-red-600" role="alert">
            {errors.foundersRelocating.message}
          </p>
        )}
        {errors.staffRelocating && (
          <p className="mt-2 text-[12.5px] text-red-600" role="alert">
            {errors.staffRelocating.message}
          </p>
        )}
        <label className="mt-5 block text-sm font-medium text-zinc-800">
          Projected Singapore revenue{' '}
          <span className="font-normal text-zinc-500">(S$)</span>
          <Input
            aria-invalid={Boolean(errors.projectedSingaporeRevenue)}
            className={fieldClass}
            min="0"
            step="1"
            type="number"
            {...register('projectedSingaporeRevenue', { valueAsNumber: true })}
          />
          <span className="mt-1.5 block text-[12.5px] font-normal text-zinc-500">
            For example, {formatMoney(500000)} in year one.
          </span>
        </label>
        {errors.projectedSingaporeRevenue && (
          <p className="mt-2 text-[12.5px] text-red-600" role="alert">
            {errors.projectedSingaporeRevenue.message}
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
