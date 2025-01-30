import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // افترض أننا نستخدم Prisma لقاعدة البيانات

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, url, points } = req.body;
      const newTask = await prisma.task.create({
        data: {
          title,
          url,
          points,
          completed: false,
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Error creating task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
