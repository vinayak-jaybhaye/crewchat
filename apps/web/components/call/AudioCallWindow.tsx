'use client'

import { useEffect, useRef, useState } from "react"
import {
    Mic, MicOff, PhoneOff, Minimize2, Maximize2, Volume2, VolumeOff
} from "lucide-react"
import { useCall } from "@/hooks/useWebRTC"
import { getUserById } from "@/app/actions/UserActions"
import { UserDTO } from "@crewchat/types"
import { useSession } from "next-auth/react"
import Image from "next/image"
import type { Call } from "./CallWindow"

interface AudioCallWindowProps {
    socket: any
    remoteUserId: string
    localUserId: string
    call: Call
    DeleteCall: () => void
}

export function AudioCallWindow({
    socket,
    remoteUserId,
    localUserId,
    DeleteCall,
    call
}: AudioCallWindowProps) {
    const localRef = useRef<HTMLAudioElement>(null)
    const remoteRef = useRef<HTMLAudioElement>(null)

    const [duration, setDuration] = useState(0)
    const [isFullScreen, setIsFullScreen] = useState(true)
    const [remoteUserData, setRemoteUserData] = useState<UserDTO | null>(null)
    const [localUserData, setLocalUserData] = useState<UserDTO | null>(null)
    const [volumeOn, setVolumeOn] = useState(true)

    const { caller, acceptedAt, createdAt } = call
    const session = useSession()

    const {
        localStream,
        remoteStream,
        toggleMicrophone,
        micOn,
        hangUp,
    } = useCall({
        socket,
        remoteUserId,
        localUserId,
        callType: "audio",
        isCaller: localUserId === caller,
    })

    // Fetch users
    useEffect(() => {
        async function fetchData() {
            const remote = await getUserById(remoteUserId)
            if (remote) {
                setRemoteUserData(remote)
                const local = {
                    username: session.data?.user.username!,
                    _id: session.data?.user._id!,
                    avatarUrl: session.data?.user.avatarUrl!,
                    email: session.data?.user.email!,
                }
                setLocalUserData(local)
            }
        }
        fetchData()
    }, [])

    // Track call duration
    useEffect(() => {
        const startedAt = acceptedAt || createdAt
        if (!startedAt) return
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAt) / 1000)
            setDuration(elapsed)
        }, 1000)
        return () => clearInterval(interval)
    }, [call])

    // Stream assignment
    useEffect(() => {
        if (localRef.current && localStream)
            localRef.current.srcObject = localStream
    }, [localStream])

    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream
            remoteRef.current.volume = 1.0;
        }
    }, [remoteStream])

    const handleEndCall = async () => {
        [localRef, remoteRef].forEach(ref => {
            if (ref.current) ref.current.srcObject = null
        })
        await hangUp()
        DeleteCall()
    }

    useEffect(() => {
        return () => {
            [localRef, remoteRef].forEach(ref => {
                if (ref.current) ref.current.srcObject = null
            })
        }
    }, [])

    function formatTime(sec: number) {
        const mins = Math.floor(sec / 60).toString().padStart(2, "0")
        const secs = (sec % 60).toString().padStart(2, "0")
        return `${mins}:${secs}`
    }

    return (
        <div className={`relative z-50 text-white flex flex-col items-center justify-between w-full ${isFullScreen ? "h-screen" : "h-auto"} bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800`}>

            {/* Hidden audio stream playback */}
            <audio ref={remoteRef} autoPlay muted={!volumeOn} playsInline hidden />
            {/* <audio ref={localRef} autoPlay playsInline hidden /> */}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 w-full border-b border-slate-700/50 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    {remoteUserData?.avatarUrl ? (
                        <Image
                            src={remoteUserData.avatarUrl}
                            width={40}
                            height={40}
                            alt="Avatar"
                            className="rounded-full border border-white object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                            {remoteUserData?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                </div>

                {!isFullScreen && <div className="flex items-center justify-center gap-4 p-6">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-black/30 border border-slate-600 rounded-lg text-xs font-mono text-slate-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>{formatTime(duration)}</span>
                    </div>

                    <button
                        onClick={toggleMicrophone}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition ${micOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
                    >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setVolumeOn(!volumeOn)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition ${volumeOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
                    >
                        {volumeOn ? <Volume2 className="w-5 h-5" /> : <VolumeOff className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition"
                    >
                        <PhoneOff className="w-5 h-5" />
                    </button>
                </div>
                }
                <div className="flex items-center space-x-4">


                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 rounded-lg hover:bg-slate-800/50 transition"
                    >
                        {isFullScreen ? (
                            <Minimize2 className="w-5 h-5 text-slate-400" />
                        ) : (
                            <Maximize2 className="w-5 h-5 text-slate-400" />
                        )}
                    </button>
                </div>
            </div>

            {
                isFullScreen && (
                    <div>
                        {/* Middle status section */}
                        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-6 text-center">
                            <div className="flex items-center space-x-3">
                                {remoteUserData?.avatarUrl ? (
                                    <Image
                                        src={remoteUserData.avatarUrl}
                                        width={200}
                                        height={200}
                                        alt="Avatar"
                                        className="rounded-full border border-white object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                                        {remoteUserData?.username?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}

                            </div>
                            <div className="text-xl font-semibold text-white">
                                {remoteUserData?.username || "Calling..."}
                            </div>
                            <div className="text-sm text-slate-400">
                                Audio call in progress
                            </div>
                            <div className="text-lg font-mono text-slate-300">{formatTime(duration)}</div>
                        </div>

                        {/* Call Controls */}
                        <div className="flex items-center justify-center gap-4 p-6">
                            <button
                                onClick={toggleMicrophone}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${micOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
                            >
                                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setVolumeOn(!volumeOn)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${volumeOn ? "bg-slate-700 text-white" : "bg-red-600 text-white"}`}
                            >
                                {volumeOn ? <Volume2 className="w-5 h-5" /> : <VolumeOff className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={handleEndCall}
                                className="w-12 h-12 rounded-full bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
