// app/api/tasks/route.ts

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const telegramInitData = url.searchParams.get('initData');

  if (!telegramInitData) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Development bypass - return mock task data
  if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
    console.log("DEVELOPMENT BYPASS - Returning mock task data");
    
    const mockTasks = [
      {
        id: "1",
        title: "Join our Telegram Channel",
        description: "Subscribe to our official Telegram channel",
        points: 5000,
        image: "telegram",
        category: "telegram",
        isActive: true,
        type: "TELEGRAM",
        callToAction: "Subscribe",
        taskData: {
          link: "https://t.me/clicker_game_news"
        },
        taskStartTimestamp: null,
        isCompleted: false
      },
      {
        id: "2", 
        title: "Follow us on X",
        description: "Follow our X account for updates",
        points: 2500,
        image: "x",
        category: "social",
        isActive: true,
        type: "VISIT",
        callToAction: "Follow",
        taskData: {
          link: "https://x.com/example"
        },
        taskStartTimestamp: null,
        isCompleted: false
      },
      {
        id: "3",
        title: "Visit our Website", 
        description: "Check out our official website",
        points: 1000,
        image: "website",
        category: "visit",
        isActive: true,
        type: "VISIT",
        callToAction: "Visit",
        taskData: {
          link: "https://nikandr.com"
        },
        taskStartTimestamp: null,
        isCompleted: false
      }
    ];

    return NextResponse.json({
      tasks: mockTasks,
    });
  }

  const { validatedData, user } = validateTelegramWebAppData(telegramInitData);

  if (!validatedData) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
  }

  const telegramId = user.id?.toString();

  if (!telegramId) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  try {
    // Fetch the user
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch only active tasks
    const activeTasks = await prisma.task.findMany({
      where: { isActive: true },
    });

    // Fetch valid UserTask entries for this user, only for active tasks
    const validUserTasks = await prisma.userTask.findMany({
      where: {
        userId: user.id,
        task: { 
          isNot: undefined,
          isActive: true
        },
      },
      include: {
        task: true,
      },
    });

    // Prepare the response data
    const tasksData = activeTasks.map(task => {
      const userTask = validUserTasks.find(ut => ut.taskId === task.id);
      return {
        ...task,
        taskStartTimestamp: userTask?.taskStartTimestamp || null,
        isCompleted: userTask?.isCompleted || false,
      };
    });

    return NextResponse.json({
      tasks: tasksData,
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch user tasks' }, { status: 500 });
  }
}