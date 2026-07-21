'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ProfileSchema } from '@/lib/schemas';
import { type DraftProfile } from '@/store/use-profile-store';

const stepSchema = ProfileSchema.pick({ homeCountry: true });
type StepValues = z.infer<typeof stepSchema>;

const countries = [
  ['brunei', 'Brunei'],
  ['cambodia', 'Cambodia'],
  ['indonesia', 'Indonesia'],
  ['laos', 'Laos'],
  ['malaysia', 'Malaysia'],
  ['myanmar', 'Myanmar'],
  ['philippines', 'Philippines'],
  ['thailand', 'Thailand'],
  ['vietnam', 'Vietnam'],
] as const;

type StepHomeCountryProps = {
  draft: DraftProfile;
  onValid: (values: StepValues) => void;
};

export function StepHomeCountry({ draft, onValid }: StepHomeCountryProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: { homeCountry: draft.homeCountry },
  });
  return (
    <form noValidate onSubmit={handleSubmit(onValid)}>
      <fieldset>
        <legend className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          Where is your business based today?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-foreground">
          Choose your ASEAN home country.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {countries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('homeCountry')}
              />
              <span className="flex min-h-14 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-primary">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.homeCountry && (
          <p className="mt-3 text-[12.5px] text-destructive" role="alert">
            {errors.homeCountry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-end">
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
