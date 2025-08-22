import Sidebar from '@/app/dashboard/components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
            <div className="flex">
                <div className='w-16 bg-gradient-to-b from-indigo-50/80 via-blue-50/60 to-violet-50/40 min-h-screen  py-3 shadow-lg border-r border-indigo-100/50 flex justify-center'>
                    <Sidebar/>
                </div>
                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good morning! 👋
              </h1>
              <p className="text-gray-600">
                Here's how your wellness journey is progressing today.
              </p>
            </div> */}

                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}