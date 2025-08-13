import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const selections = Array.isArray(body?.selections) ? body.selections : [];

    if (selections.length > 4) {
      return NextResponse.json(
        { ok: false, error: 'You can select at most 4 fingerprints.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, count: selections.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}


