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
        <legend className="text-[20px] font-semibold tracking-[-0.025em] text-zinc-950">
          Where is your business based today?
        </legend>
        <p className="mt-2 text-[14.5px] leading-6 text-zinc-700">
          Choose your ASEAN home country.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {countries.map(([value, label]) => (
            <label className="group relative cursor-pointer" key={value}>
              <input
                className="peer sr-only"
                type="radio"
                value={value}
                {...register('homeCountry')}
              />
              <span className="flex min-h-12 items-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-800 group-focus-within:outline-2 group-focus-within:outline-offset-3 group-focus-within:outline-teal-700">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.homeCountry && (
          <p className="mt-3 text-[12.5px] text-red-600" role="alert">
            {errors.homeCountry.message}
          </p>
        )}
      </fieldset>
      <div className="mt-8 flex justify-end">
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
