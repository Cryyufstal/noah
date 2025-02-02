const handleCompleteTask = async (id: number, points: number) => {
  const newPoints = userPoints + points;

  // تحديث النقاط
  setUserPoints(newPoints);

  // إزالة المهمة المكتملة وتحديث القائمة
  const updatedTasks = tasks.filter((task) => task.id !== id);
  setTasks(updatedTasks);

  // تحديث `localStorage`
  if (user?.telegramId) {
    localStorage.setItem(`tasks_${user.telegramId}`, JSON.stringify(updatedTasks));
  }

  // تحديث النقاط في الخادم
  await fetch('/api/update-points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      telegramId: user?.telegramId,
      points: newPoints,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.error('❌ Error updating points:', data.error);
      } else {
        console.log('✅ Points updated successfully');
      }
    })
    .catch((err) => {
      console.error('❌ Error updating points:', err);
    });
};
