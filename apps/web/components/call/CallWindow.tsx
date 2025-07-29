'use client'

import { useEffect, useState } from 'react';
import CallLobby from './CallLobby';
import { useGlobalSocket } from '@/context/SocketProvider';
// import { VideoCallWindow } from './VideoCallWindow';
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
  acceptedAt?: number;
}

function CallWindow() {
  const socket = useGlobalSocket();
  const [call, setCall] = useState<Call | null>(null);
  const session = useSession();
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

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

  console.log("CallWindow rendered with call:", call);

  useEffect(() => {
    const sessionUserId = session.data?.user._id;
    if (!sessionUserId || !call) return;

    setLocalUserId(sessionUserId);

    const remoteUserId = call.caller === sessionUserId ? call.callee : call.caller;
    setRemoteUserId(remoteUserId);

  }, [session.data?.user._id, call]);

  const deleteCall = () => {
    setCall(null);
  }


  return (
    <>
      {call && call.status == 'calling' && (
        <CallLobby
          call={call}
          remoteUserId = {remoteUserId!}
          localUserId = {localUserId!}
          deleteCall={deleteCall}
        />
      )}

      {
        call?.status === 'accepted' && remoteUserId && localUserId && (

          <div >
            {
              call.type === 'video' ? (
                <VideoCallWindow
                  socket={socket}
                  remoteUserId={remoteUserId}
                  localUserId={localUserId}
                  DeleteCall={handleHangUp}
                  call = {call}
                />
              ) : (
                <AudioCallWindow
                  socket={socket}
                  remoteUserId={remoteUserId}
                  localUserId={localUserId}
                  DeleteCall={handleHangUp}
                  caller={call.caller}
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
