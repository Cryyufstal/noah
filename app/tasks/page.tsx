import Image from 'next/image'; // استيراد Image من Next.js

export default function TasksPage() {
  // باقي الكود كما هو...

  const handleOpenAdsGram = () => {
    window.open('https://adsgram.me/block/int-7496', '_blank');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Tasks</h1>

      {/* زر الإعلانات */}
      <button
        onClick={handleOpenAdsGram}
        className="fixed top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded flex items-center gap-2"
      >
        <Image src="/ads-icon.svg" alt="Ads" width={24} height={24} />
        <span>إعلان</span>
      </button>

      <div className="mb-4 text-lg font-medium">
        Your Points: <span className="text-green-400">{userPoints}</span>
      </div>

      {/* قائمة المهام */}
      <ul className="w-full max-w-lg bg-gray-800 rounded-lg shadow-lg">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center p-4 border-b border-gray-700 last:border-none"
          >
            <span className="text-lg font-semibold">{task.title}</span>
            {!task.completed ? (
              <button
                onClick={() => {
                  window.open(task.url, '_blank');
                  handleOpenTask(task.id);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded transition-all"
              >
                Task
              </button>
            ) : (
              <button
                onClick={() => handleCompleteTask(task.id, task.points)}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded transition-all"
              >
                Check
              </button>
            )}
          </li>
        ))}
      </ul>
      <BottomNavigation />
    </main>
  );
            }
