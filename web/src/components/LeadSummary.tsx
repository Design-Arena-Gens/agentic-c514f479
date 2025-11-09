'use client';

import type { Lead } from '@/lib/types';

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const percentage = (value: number, total: number) => {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

const postedWithinHours = (lead: Lead, hours: number) => {
  if (!lead.jobPostedAt) return false;
  const posted = new Date(lead.jobPostedAt);
  if (Number.isNaN(posted.getTime())) return false;
  const delta = (Date.now() - posted.getTime()) / (1000 * 60 * 60);
  return delta <= hours;
};

export function LeadSummary({ leads }: { leads: Lead[] }) {
  if (!leads.length) return null;

  const statesCovered = new Set(
    leads.map((lead) => lead.location.state).filter(Boolean) as string[],
  );
  const withPhones = leads.filter((lead) => lead.phone);
  const withEmails = leads.filter((lead) => lead.email);
  const hotLeads = leads.filter((lead) => postedWithinHours(lead, 12));
  const avgConfidence = average(leads.map((lead) => lead.enrichment.confidence));

  const metrics = [
    {
      label: 'Qualified Leads',
      value: leads.length.toString(),
      detail: `${hotLeads.length} flagged as highest urgency`,
    },
    {
      label: 'State Coverage',
      value: statesCovered.size.toString(),
      detail: `Phones on ${percentage(withPhones.length, leads.length)} of records`,
    },
    {
      label: 'Email Capture',
      value: percentage(withEmails.length, leads.length),
      detail: 'Unique addresses ready for outreach',
    },
    {
      label: 'Confidence Index',
      value: `${Math.round(avgConfidence * 100)}%`,
      detail: 'Composite of contact completeness & freshness',
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-5 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {metric.label}
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</div>
          <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}

