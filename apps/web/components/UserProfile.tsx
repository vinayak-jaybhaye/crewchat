import React from 'react'
import { useSession } from 'next-auth/react';

function UserProfile() {
    const { data: session } = useSession();
  return (
    <div>
      {
        session?.user ? (
          <div className="flex items-center space-x-4">
            <img src={session.user.avatarUrl || session.user.image || '/default-avatar.png'} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-lg font-semibold">{session.user.username}</h2>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No user session found</p>
        )       
      }
    </div>
  )
}

export default UserProfile
