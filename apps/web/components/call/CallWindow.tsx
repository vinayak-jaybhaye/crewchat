'use client'

import { useEffect, useState } from 'react';
import CallLobby from './CallLobby';
import { useGlobalSocket } from '@/context/SocketProvider';
import { VideoCallWindow } from './VideoCallWindow';
import { AudioCallWindow } from './AudioCallWindow';
import { useSession } from 'next-auth/react';

export interface Call {
  callId: string;
  caller: string;
  callee: string;
  type: "video" | "audio";
  status: "calling" | "incoming" | "accepted" | "rejected";
  createdAt?: number;
}

function CallWindow() {
  const socket = useGlobalSocket();
  const [call, setCall] = useState<Call | null>(null);
  const session = useSession();

  useEffect(() => {
    if (!socket) return;

    // On mount, get the active call for the user if any
    socket.emit('get-active-call', { userId: session.data?.user._id });

    socket.on("incoming-call", (callData) => {
      console.log("Incoming call:", callData);
      console.log("INCOMING CALL", callData);
      setCall(callData);
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [socket, session.data?.user._id]);

  const handleHangUp = () => {
    if (!socket || !call) return;
    socket.emit('hang-up', {
      callId: call.callId,
      by: session.data?.user._id,
    });
    console.log("Call ended by", session.data?.user._id);
  };

  const localUserId = session.data?.user._id;
  const remoteUserId = call?.caller === localUserId ? call?.callee : call?.caller;
  console.log("Other user in call:", remoteUserId);

  return (
    <>
      {call && call.status == 'calling' && (
        <CallLobby
          call={call}
        />
      )}

      {
        call?.status === 'accepted' && remoteUserId && localUserId && (

          <div>
            {
              call.type === 'video' ? (
                <VideoCallWindow
                  socket={socket}
                  remoteUserId={remoteUserId}
                  localUserId={localUserId}
                  DeleteCall={handleHangUp}
                />
              ) : (
                <AudioCallWindow
                  socket={socket}
                  remoteUserId={remoteUserId}
                  localUserId={localUserId}
                  DeleteCall={handleHangUp}
                />
              )
            }

          </div>
        )
      }

    </>
  );
}

export default CallWindow;
