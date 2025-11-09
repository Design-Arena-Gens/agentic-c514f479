import { gatherLeads } from '@/lib/lead-service';
import type { LeadQueryOptions } from '@/lib/types';
import { DEFAULT_TARGET_TOTAL } from '@/lib/utils';

export const runtime = 'nodejs';

const parseStates = (value: string | null) =>
  value
    ?.split(',')
    .map((state) => state.trim().toUpperCase())
    .filter(Boolean) ?? [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const states = parseStates(searchParams.get('states'));
    const targetTotal = Number(searchParams.get('target') ?? DEFAULT_TARGET_TOTAL);
    const keyword = searchParams.get('keyword') ?? undefined;

    const options: LeadQueryOptions = {
      states,
      targetTotal: Number.isNaN(targetTotal) ? DEFAULT_TARGET_TOTAL : targetTotal,
      keyword,
    };

    const leads = await gatherLeads(options);

    return Response.json(
      {
        leads,
        meta: {
          count: leads.length,
          generatedAt: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Lead aggregation failed', error);
    return Response.json(
      { error: 'Unable to retrieve leads at this time' },
      { status: 500 },
    );
  }
}

