'use client';

import { useRouter } from 'next/navigation';

export default function GlobalError() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-gray-600 mb-8">Sorry, an unexpected error has occurred.</p>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
}
