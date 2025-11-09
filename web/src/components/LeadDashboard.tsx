'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { LeadFilters } from '@/components/LeadFilters';
import { LeadSummary } from '@/components/LeadSummary';
import { LeadTable } from '@/components/LeadTable';
import type { Lead } from '@/lib/types';
import { DEFAULT_TARGET_TOTAL, defaultStates } from '@/lib/utils';

type ApiResponse =
  | { leads: Lead[]; meta: { count: number; generatedAt: string } }
  | { error: string };

const CSV_HEADERS = [
  'Practice Name',
  'Phone',
  'Email',
  'City',
  'State',
  'Postal Code',
  'Address',
  'Job Title',
  'Job URL',
  'Job Posted',
  'Practice Website',
  'Decision Maker',
  'NPI Number',
  'Confidence Score',
  'Quality Notes',
  'Salary Min',
  'Salary Max',
  'Salary Currency',
];

const toCsvRow = (lead: Lead) => [
  lead.practiceName ?? '',
  lead.phone ?? '',
  lead.email ?? '',
  lead.location.city ?? '',
  lead.location.state ?? '',
  lead.location.postalCode ?? '',
  lead.location.addressLine1 ?? '',
  lead.jobTitle ?? '',
  lead.jobUrl ?? '',
  lead.jobPostedAt ?? '',
  lead.practiceWebsite ?? '',
  lead.decisionMaker ?? '',
  lead.enrichment.npiNumber ?? '',
  (lead.enrichment.confidence * 100).toFixed(0),
  lead.enrichment.qualityNotes.join(' | '),
  lead.salary.min?.toString() ?? '',
  lead.salary.max?.toString() ?? '',
  lead.salary.currency ?? '',
];

const createCsv = (leads: Lead[]) => {
  const rows = [CSV_HEADERS, ...leads.map(toCsvRow)];
  return rows
    .map((row) =>
      row
        .map((field) => {
          const value = field ?? '';
          if (typeof value !== 'string') return value;
          if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(','),
    )
    .join('\n');
};

export function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>(defaultStates);
  const [targetTotal, setTargetTotal] = useState<number>(DEFAULT_TARGET_TOTAL);
  const [keyword, setKeyword] = useState<string>('dental receptionist');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        target: String(targetTotal),
        keyword,
      });
      if (selectedStates.length) {
        params.set('states', selectedStates.join(','));
      }

      const response = await fetch(`/api/leads?${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const payload = (await response.json()) as ApiResponse;
      if ('error' in payload) {
        throw new Error(payload.error);
      }
      setLeads(payload.leads);
    } catch (err) {
      setError((err as Error).message ?? 'Unable to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedStates, targetTotal]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const handleExport = useCallback(() => {
    if (!leads.length) return;
    const blob = new Blob([createCsv(leads)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dental-reception-leads-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [leads]);

  const heroCopy = useMemo(
    () => ({
      title: 'Dental Reception Lead Radar',
      subtitle:
        'Grabs U.S. practices advertising reception openings in the last 24 hours, enriches with NPI contact data, and flags the most actionable accounts.',
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Pipeline Intelligence
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {heroCopy.title}
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            {heroCopy.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={!leads.length}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Export CSV
            </button>
            {isLoading ? (
              <span className="inline-flex items-center text-sm text-slate-500">
                Syncing results…
              </span>
            ) : (
              <span className="inline-flex items-center text-sm text-slate-500">
                {leads.length ? `Latest pull: ${leads.length} leads` : 'No data yet'}
              </span>
            )}
          </div>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : null}
        </section>

        <LeadFilters
          selectedStates={selectedStates}
          onStatesChange={setSelectedStates}
          targetTotal={targetTotal}
          onTargetTotalChange={setTargetTotal}
          keyword={keyword}
          onKeywordChange={setKeyword}
          onRefresh={fetchLeads}
          isLoading={isLoading}
        />

        <LeadSummary leads={leads} />
        <LeadTable leads={leads} />
      </div>
    </main>
  );
}

