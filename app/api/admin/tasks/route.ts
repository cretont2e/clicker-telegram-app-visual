// app/api/admin/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// ✅ 허용된 IP 리스트 (localhost 포함)
const ALLOWED_IPS = [
  '127.0.0.1',     // IPv4 localhost
  '::1',           // IPv6 localhost
  '121.160.74.110'   // 실제 외부 고정 IP 예시
  ,'59.6.190.163'
];

function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim(); // 첫 번째 IP만 사용
  }
  const remoteAddr = req.headers.get('x-real-ip') || null;
  return remoteAddr;
}

function isAccessAllowed(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAdminAccessEnabled = process.env.ACCESS_ADMIN === 'true';
  return clientIp && ALLOWED_IPS.includes(clientIp) && isAdminAccessEnabled;
}

export async function GET(req: NextRequest) {
  if (!isAccessAllowed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const tasks = await prisma.task.findMany();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  if (!isAccessAllowed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const taskData = await req.json();
  const task = await prisma.task.create({ data: taskData });
  return NextResponse.json(task);
}
