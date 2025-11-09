'use client';

import { useMemo, useState } from 'react';

import type { Lead } from '@/lib/types';

type SortKey =
  | 'practiceName'
  | 'jobPostedAt'
  | 'confidence'
  | 'state'
  | 'salary';

type SortDirection = 'asc' | 'desc';

const formatDate = (value: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatCurrency = (value: number | null | undefined, currency = 'USD') => {
  if (value === null || value === undefined) return '-';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value}`;
  }
};

const confidenceColor = (score: number) => {
  if (score >= 0.75) return 'bg-emerald-600';
  if (score >= 0.5) return 'bg-amber-500';
  return 'bg-rose-500';
};

const nextDirection = (direction: SortDirection): SortDirection =>
  direction === 'asc' ? 'desc' : 'asc';

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('jobPostedAt');
  const [direction, setDirection] = useState<SortDirection>('desc');

  const sortedLeads = useMemo(() => {
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...leads].sort((a, b) => {
      switch (sortKey) {
        case 'practiceName':
          return (
            (a.practiceName || '').localeCompare(b.practiceName || '') * multiplier
          );
        case 'jobPostedAt': {
          const dateA = a.jobPostedAt ? new Date(a.jobPostedAt).getTime() : 0;
          const dateB = b.jobPostedAt ? new Date(b.jobPostedAt).getTime() : 0;
          return (dateA - dateB) * multiplier;
        }
        case 'confidence':
          return (
            ((a.enrichment.confidence ?? 0) - (b.enrichment.confidence ?? 0)) *
            multiplier
          );
        case 'state':
          return (
            (a.location.state || '').localeCompare(b.location.state || '') *
            multiplier
          );
        case 'salary': {
          const salaryA = a.salary.max ?? a.salary.min ?? 0;
          const salaryB = b.salary.max ?? b.salary.min ?? 0;
          return (salaryA - salaryB) * multiplier;
        }
        default:
          return 0;
      }
    });
  }, [leads, sortKey, direction]);

  const onSortChange = (key: SortKey) => {
    if (key === sortKey) {
      setDirection(nextDirection(direction));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Practice
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Job
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              onClick={() => onSortChange('jobPostedAt')}
            >
              Posted
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              onClick={() => onSortChange('state')}
            >
              Location
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Decision Maker
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              onClick={() => onSortChange('salary')}
            >
              Salary
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              onClick={() => onSortChange('confidence')}
            >
              Quality
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {sortedLeads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-4 align-top">
                <div className="font-semibold text-slate-900">{lead.practiceName}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {lead.location.addressLine1 ? <span>{lead.location.addressLine1}</span> : null}
                  {lead.location.postalCode ? (
                    <span className="ml-2">{lead.location.postalCode}</span>
                  ) : null}
                </div>
                {lead.practiceWebsite ? (
                  <a
                    href={lead.practiceWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex text-xs text-sky-600 hover:text-sky-700"
                  >
                    Visit site
                  </a>
                ) : null}
              </td>
              <td className="px-4 py-4 align-top">
                <div className="font-medium text-slate-900">{lead.jobTitle}</div>
                {lead.jobUrl ? (
                  <a
                    href={lead.jobUrl}
                    className="mt-1 inline-flex text-xs text-sky-600 hover:text-sky-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View posting
                  </a>
                ) : null}
              </td>
              <td className="px-4 py-4 align-top text-sm text-slate-600">
                {formatDate(lead.jobPostedAt)}
              </td>
              <td className="px-4 py-4 align-top">
                <div>{[lead.location.city, lead.location.state].filter(Boolean).join(', ') || '-'}</div>
              </td>
              <td className="px-4 py-4 align-top text-sm">
                <div>{lead.phone ?? '-'}</div>
                <div className="mt-1 text-xs text-slate-500">{lead.email ?? '-'}</div>
              </td>
              <td className="px-4 py-4 align-top text-sm text-slate-600">
                {lead.decisionMaker ?? '-'}
              </td>
              <td className="px-4 py-4 align-top text-sm text-slate-600">
                {lead.salary.min || lead.salary.max
                  ? `${formatCurrency(lead.salary.min, lead.salary.currency ?? undefined)} – ${formatCurrency(
                      lead.salary.max,
                      lead.salary.currency ?? undefined,
                    )}`
                  : '-'}
              </td>
              <td className="px-4 py-4 align-top">
                <span
                  className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-2 py-1 text-xs font-semibold text-white ${confidenceColor(
                    lead.enrichment.confidence,
                  )}`}
                >
                  {(lead.enrichment.confidence * 100).toFixed(0)}%
                </span>
              </td>
              <td className="px-4 py-4 align-top text-xs text-slate-500">
                {lead.enrichment.qualityNotes.length
                  ? lead.enrichment.qualityNotes.join('; ')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

