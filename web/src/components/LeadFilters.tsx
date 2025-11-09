'use client';

import { defaultStates } from '@/lib/utils';

type LeadFiltersProps = {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  targetTotal: number;
  onTargetTotalChange: (value: number) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

const stateOptions = defaultStates;

export function LeadFilters({
  selectedStates,
  onStatesChange,
  targetTotal,
  onTargetTotalChange,
  keyword,
  onKeywordChange,
  onRefresh,
  isLoading,
}: LeadFiltersProps) {
  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      onStatesChange(selectedStates.filter((value) => value !== state));
    } else {
      onStatesChange([...selectedStates, state]);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Role Focus
            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="dental receptionist"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <p className="text-xs text-slate-500">
            Adjust the keyword to pivot between reception, treatment coordinator, or front office roles.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Target Leads
            <input
              type="number"
              min={20}
              max={240}
              step={10}
              value={targetTotal}
              onChange={(event) => onTargetTotalChange(Number(event.target.value))}
              className="mt-2 w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <p className="text-xs text-slate-500">
            Requests 100-200 leads by default. Increase if you have adequate API capacity.
          </p>
        </div>
        <div className="flex h-full items-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-wait disabled:bg-sky-400"
          >
            {isLoading ? 'Refreshing…' : 'Refresh Leads'}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-700">Priority States</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 md:grid-cols-6">
          {stateOptions.map((state) => {
            const active = selectedStates.includes(state);
            return (
              <button
                type="button"
                key={state}
                onClick={() => toggleState(state)}
                className={`rounded-lg border px-3 py-1.5 font-medium transition ${
                  active
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Select the regions where you want to concentrate the search. Leave empty to sweep all default states.
        </p>
      </div>
    </section>
  );
}

