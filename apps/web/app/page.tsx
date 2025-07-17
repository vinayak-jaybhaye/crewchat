'use client';

import { useEffect, useState } from 'react';

export default function CheckConnection() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      const res = await fetch('/api/check-connection');
      const data = await res.json();
      setStatus(data.message);
    }

    checkConnection();
  }, []);

  return (
    <div>
      <h1>Check DB Connection</h1>
      <p>{status ?? "Checking..."}</p>
    </div>
  );
}
