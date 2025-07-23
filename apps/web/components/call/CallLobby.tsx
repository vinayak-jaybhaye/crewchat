'use client';

import React, { useEffect } from 'react';
import { useGlobalSocket } from '@/context/SocketProvider';
import { useSession } from 'next-auth/react';
import { Call } from './CallWindow';

export default function CallLobby({ call }: { call: Call }) {
  const socket = useGlobalSocket();
  const session = useSession();

  if (!call) return null;

  const handleAccept = () => {
    if (!socket) return;

    socket.emit('accept-call', {
      callId: call.callId,
    });

    console.log("Accepted Incoming call", call);
    console.log("Call accepted by", session.data?.user._id);
  };

  const handleReject = () => {
    if (!socket) return;

    socket.emit('reject-call', {
      callId: call.callId,
    });

    console.log("Rejected Incoming call", call);
  };

  useEffect(() => {
    if (!socket) return;

    const onCallEnded = (data: { other: string }) => {
      if (call && call.caller === data.other) {
      }
    };

    socket.on('call-ended', onCallEnded);

    return () => {
      socket.off('call-ended', onCallEnded);
    };
  }, [socket, call]);

  const handleEndCall = () => {
    if (!socket) return;

    socket.emit('hang-up', {
      callId: call.callId,
      by: session.data?.user._id,
    });

    console.log("Call ended by", session.data?.user._id);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      {
        call.callee === session.data?.user._id ? (<div className="bg-white rounded-xl p-6 shadow-lg text-center space-y-4 w-[90%] max-w-md">
          <h2 className="text-xl font-semibold">Incoming {call.type} call</h2>
          <p className="text-gray-600">From: {call.caller}</p>
          <div className="flex justify-center gap-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
              onClick={handleReject}
            >
              Reject
            </button>
          </div>
        </div>) : (
          <div>
            <h2 className="text-xl font-semibold">Call in progress</h2>
            <p className="text-gray-600">You are currently in a {call.type} call with {call.caller}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition mt-4"
              onClick={handleEndCall}
            >
              End Call
            </button>
          </div>
        )
      }
    </div>
  );
}
