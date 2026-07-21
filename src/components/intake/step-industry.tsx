'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ProfileSchema } from '@/lib/schemas';
import { type DraftProfile } from '@/store/use-profile-store';

const stepSchema = ProfileSchema.pick({ industry: true });
type StepValues = z.infer<typeof stepSchema>;
const industries = [
  ['fnb', 'Food & beverage'],
  ['saas', 'B2B SaaS'],
  ['fintech', 'Fintech'],
  ['retail', 'Retail'],
  ['medical-devices', 'Medical devices'],
  ['generic', 'Another industry'],
] as const;

type StepIndustryProps = {
  draft: DraftProfile;
  onBack: () => void;
  onValid: (values: StepValues) => void;
};
export function StepIndustry({ draft, onBack, onValid }: StepIndustryProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { industry: draft.industry },
  });
  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset>
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          What best describes your business?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Choose the industry closest to your main Singapore activity.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {industries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('industry')}
              />
              <span className="flex min-h-14 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.industry && (
          <p className="mt-3 text-[12.5px] text-destructive" role="alert">
            {errors.industry.message}
          </p>
        )}
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
          Continue
        </Button>
      </div>
    </form>
  );
}
