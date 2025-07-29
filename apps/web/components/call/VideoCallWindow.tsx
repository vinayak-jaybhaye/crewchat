"use client"

import { useEffect, useRef, useState } from "react"
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, Maximize2, Minimize2, Menu, X } from "lucide-react"
import { useCall } from "@/hooks/useCall"
import { getUserById } from "@/app/actions/UserActions"
import { UserDTO } from "@crewchat/types"
import type { Call } from "./CallWindow"
import { useSession } from "next-auth/react"
import Image from "next/image"

interface VideoCallWindowProps {
    socket: any
    remoteUserId: string
    localUserId: string
    call: Call
    DeleteCall: () => void
}

export function VideoCallWindow({
    socket,
    remoteUserId,
    localUserId,
    DeleteCall,
    call
}: VideoCallWindowProps) {
    const localRef = useRef<HTMLVideoElement>(null)
    const remoteRef = useRef<HTMLVideoElement>(null)
    const localScreenRef = useRef<HTMLVideoElement>(null)
    const remoteScreenRef = useRef<HTMLVideoElement>(null)
    const mainViewRef = useRef<HTMLVideoElement>(null)

    // Hidden audio-only elements for minimized mode
    const remoteAudioRef = useRef<HTMLVideoElement>(null)
    const localAudioRef = useRef<HTMLVideoElement>(null)
    const remoteScreenAudioRef = useRef<HTMLVideoElement>(null)
    const localScreenAudioRef = useRef<HTMLVideoElement>(null)

    const remoteMobileRef = useRef<HTMLVideoElement>(null)
    const localScreenMobileRef = useRef<HTMLVideoElement>(null)
    const remoteScreenMobileRef = useRef<HTMLVideoElement>(null)
    const [duration, setDuration] = useState(0)
    const [isFullScreen, setIsFullScreen] = useState<boolean>(true)

    const [remoteUserData, setRemoteUserData] = useState<UserDTO | null>(null);
    const [localUserData, setLocalUserData] = useState<UserDTO | null>(null);
    // Track which video is currently in the main view
    const [mainView, setMainView] = useState<"remote" | "remoteScreen" | "local" | "localScreen">("remote")
    const [mainViewTitle, setMainViewTitle] = useState<string>("Remote Camera")
    const [isMobile, setIsMobile] = useState(false);

    const { caller, acceptedAt, createdAt } = call;
    const session = useSession()

    useEffect(() => {
        const startedAt = acceptedAt || createdAt;
        if (!startedAt) return

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAt!) / 1000)
            setDuration(elapsed)
        }, 1000)

        return () => clearInterval(interval)
    }, [call])

    const {
        localStream,
        remoteStream,
        toggleCamera,
        toggleMicrophone,
        micOn,
        cameraOn,
        hangUp,
        toggleScreenShare,
        screenShareOn,
        localScreenStream,
        remoteScreenStream,
    } = useCall({
        socket,
        remoteUserId,
        localUserId,
        callType: "video",
        isCaller: localUserId === caller,
    })

    useEffect(() => {
        async function fetchOtherUserData() {
            const userData = await getUserById(remoteUserId);
            if (userData) {
                setRemoteUserData(userData)
                const localData = {
                    username: session.data?.user.username!,
                    _id: session.data?.user._id!,
                    avatarUrl: session.data?.user.avatarUrl!,
                    email: session.data?.user.email!,
                }
                setLocalUserData(localData);
            } else {
                console.error("Failed to fetch user data for", remoteUserId);
            }
        }

        fetchOtherUserData();
        setIsMobile(isMobileDevice());
        console.log("Is mobile device:", isMobile);
    }, []);

    const getMainViewTitle = () => {
        switch (mainView) {
            case "remote":
                return `${remoteUserData?.username || "Remote"}'s Camera`
            case "remoteScreen":
                return `${remoteUserData?.username || "Remote"}'s Screen Share`
            case "local":
                return `${localUserData?.username || "Your"} Camera`
            case "localScreen":
                return `${localUserData?.username || "Your"} Screen Share`
            default:
                return "Remote Camera"
        }
    }

    useEffect(() => {
        setMainViewTitle(getMainViewTitle())
        if (mainViewRef.current && isFullScreen) {
            mainViewRef.current.srcObject =
                mainView === "local"
                    ? localStream
                    : mainView === "remote"
                        ? remoteStream
                        : mainView === "localScreen"
                            ? localScreenStream
                            : remoteScreenStream
        }
    }, [mainView, isFullScreen])

    // Attach streams to video elements
    useEffect(() => {
        if (!localStream) return;
        const audioOnlyStream = new MediaStream(localStream.getAudioTracks())
        const videoOnlyStream = new MediaStream(localStream.getVideoTracks())

        if (localRef.current) localRef.current.srcObject = videoOnlyStream;
        if (localAudioRef.current) localAudioRef.current.srcObject = audioOnlyStream;

        if (mainView === "local" && mainViewRef.current && isFullScreen) {
            mainViewRef.current.srcObject = videoOnlyStream;
        }
    }, [localStream, mainView, isFullScreen])

    useEffect(() => {
        if (!remoteStream) return;
        const audioOnlyStream = new MediaStream(remoteStream.getAudioTracks())
        const videoOnlyStream = new MediaStream(remoteStream.getVideoTracks())
        if (remoteRef.current) remoteRef.current.srcObject = videoOnlyStream;
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = audioOnlyStream;
            remoteAudioRef.current.volume = 1.0;
        }
        if (remoteMobileRef.current) remoteMobileRef.current.srcObject = videoOnlyStream;

        if (mainView === "remote" && mainViewRef.current && isFullScreen) {
            mainViewRef.current.srcObject = videoOnlyStream;
        }
    }, [remoteStream, isFullScreen])

    useEffect(() => {
        if (!localScreenStream) return;
        const audioOnlyStream = new MediaStream(localScreenStream.getAudioTracks())
        const videoOnlyStream = new MediaStream(localScreenStream.getVideoTracks())
        if (localScreenRef.current) localScreenRef.current.srcObject = videoOnlyStream;
        if (localScreenAudioRef.current) localScreenAudioRef.current.srcObject = audioOnlyStream;
        if (localScreenMobileRef.current) localScreenMobileRef.current.srcObject = videoOnlyStream;

        if (mainView === "localScreen" && mainViewRef.current && isFullScreen) {
            mainViewRef.current.srcObject = videoOnlyStream;
        }
    }, [localScreenStream, isFullScreen])

    useEffect(() => {
        if (!remoteScreenStream) return;
        const audioOnlyStream = new MediaStream(remoteScreenStream.getAudioTracks())
        const videoOnlyStream = new MediaStream(remoteScreenStream.getVideoTracks())
        if (remoteScreenRef.current) remoteScreenRef.current.srcObject = videoOnlyStream;
        if (remoteScreenAudioRef.current) {
            remoteScreenAudioRef.current.srcObject = audioOnlyStream;
            remoteScreenAudioRef.current.volume = 1.0;
        }
        if (remoteScreenMobileRef.current) remoteScreenMobileRef.current.srcObject = videoOnlyStream;

        if (mainView === "remoteScreen" && mainViewRef.current && isFullScreen) {
            mainViewRef.current.srcObject = videoOnlyStream;
        }
    }, [remoteScreenStream, isFullScreen])

    const handleEndCall = async () => {
        // Clear all video elements
        const videoElements = [
            localRef, remoteRef, localScreenRef, remoteScreenRef, mainViewRef,
            remoteAudioRef, localAudioRef, remoteScreenAudioRef, localScreenAudioRef
        ]

        videoElements.forEach(ref => {
            if (ref.current) ref.current.srcObject = null
        })

        await hangUp()
        DeleteCall()
    }

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            const videoElements = [
                localRef, remoteRef, localScreenRef, remoteScreenRef, mainViewRef,
                remoteAudioRef, localAudioRef, remoteScreenAudioRef, localScreenAudioRef
            ]

            videoElements.forEach(ref => {
                if (ref.current) ref.current.srcObject = null
            })
        }
    }, [])

    // Format time utility
    function formatTime(seconds: number): string {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return [hrs.toString().padStart(2, "0"), mins.toString().padStart(2, "0"), secs.toString().padStart(2, "0")].join(
            ":",
        )
    }

    function isMobileDevice() {
        if (typeof window === "undefined") return false; // SSR safety
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    return (
        <div
            className={`relative text-white flex flex-col z-50 ${isFullScreen ? "h-screen" : "h-auto"
                } overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800`}
        >
            {/* audio-only global audio */}
            <div className="hidden">
                <audio ref={remoteAudioRef} autoPlay playsInline />
                <audio ref={remoteScreenAudioRef} autoPlay playsInline />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 border-b border-slate-700/50 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    {remoteUserData?.avatarUrl ?
                        <Image
                            src={remoteUserData?.avatarUrl}
                            width={34}
                            height={34}
                            alt="Avatar"
                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", marginRight: "1.5rem", border: "2px solid #e5e7eb" }}
                        /> :
                        (
                            <div className="w-12 h-12 rounded-full bg-gray-400 text-white flex items-center justify-center text-lg font-semibold border">
                                {remoteUserData?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                        )}
                    <div className="text-sm sm:text-base hidden md:flex font-semibold text-white truncate max-w-32 sm:max-w-none">
                        {remoteUserData?.username || remoteUserId}
                    </div>
                </div>

                {/* Compact controls for minimized view */}
                {!isFullScreen && (
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-mono text-slate-300">{formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleMicrophone}
                                className={`p-2 rounded-lg transition-all duration-300 ${micOn ? "bg-slate-700/80 text-white" : "bg-red-600/90 text-white"
                                    }`}
                            >
                                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={toggleCamera}
                                className={`p-2 rounded-lg transition-all duration-300 ${cameraOn ? "bg-slate-700/80 text-white" : "bg-red-600/90 text-white"
                                    }`}
                            >
                                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleEndCall}
                                className="p-2 rounded-lg bg-red-600/90 hover:bg-red-500/90 text-white transition-all duration-300"
                            >
                                <Phone className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                >
                    {isFullScreen ? (
                        <Minimize2 className="w-5 h-5 text-slate-400 hover:text-white" />
                    ) : (
                        <Maximize2 className="w-5 h-5 text-slate-400 hover:text-white" />
                    )}
                </button>
            </div>

            {/* Main Content Area */}
            {isFullScreen && (
                <div className="flex-1 flex flex-col lg:flex-row relative">
                    {/* Mobile Video Grid */}
                    <div className="lg:hidden bg-slate-800/50 border-b border-slate-700/50">
                        <div className="flex p-3 gap-3 overflow-x-auto">
                            {/* Remote Camera */}
                            <div
                                className={`relative flex-shrink-0 w-24 h-18 bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${mainView === "remote"
                                    ? "border-blue-500 ring-2 ring-blue-500/30"
                                    : "border-slate-600/50"
                                    }`}
                                onClick={() => setMainView("remote")}
                            >
                                <video ref={remoteMobileRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-xs font-medium">
                                    {remoteUserData?.username ? `${remoteUserData.username.slice(0, 3)}` : "Rem"}
                                </div>
                                {mainView === "remote" && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                            </div>

                            {/* Remote Screen Share */}
                            <div
                                className={`relative flex-shrink-0 w-24 h-18 bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${mainView === "remoteScreen"
                                    ? "border-blue-500 ring-2 ring-blue-500/30"
                                    : "border-slate-600/50"
                                    } ${!remoteScreenStream ? "opacity-60" : ""}`}
                                onClick={() => {
                                    if (remoteScreenStream) {
                                        setMainView("remoteScreen")
                                    }
                                }}
                            >
                                <video ref={remoteScreenMobileRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                                <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-xs font-medium">
                                    Screen
                                </div>
                                {mainView === "remoteScreen" && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                                {!remoteScreenStream && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
                                        <Monitor className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Local Screen Share - Only show on desktop */}
                            {!isMobile && (
                                <div
                                    className={`relative flex-shrink-0 w-24 h-18 bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-300 ${mainView === "localScreen"
                                        ? "border-blue-500 ring-2 ring-blue-500/30"
                                        : "border-slate-600/50"
                                        } ${!screenShareOn ? "opacity-60" : ""}`}
                                    onClick={() => {
                                        if (screenShareOn) {
                                            setMainView("localScreen")
                                        }
                                    }}
                                >
                                    <video ref={localScreenMobileRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                                    <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-xs font-medium">
                                        Your
                                    </div>
                                    {mainView === "localScreen" && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    )}
                                    {!screenShareOn && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
                                            <Monitor className="w-4 h-4 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Video Container */}
                    <div className="flex-1 relative bg-black">
                        {/* Main Video */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <video
                                ref={mainViewRef}
                                autoPlay
                                playsInline
                                muted
                                className="max-w-full max-h-full object-contain"
                                style={{ filter: mainView === "local" ? "blur(0px)" : "blur(1px)" }}
                            />
                        </div>

                        {/* Video Overlay Info */}
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">{mainViewTitle}</span>
                            </div>
                        </div>

                        {/* Local Video Picture-in-Picture */}
                        {mainView !== "local" && (
                            <div
                                className="absolute top-20 sm:bottom-24 left-4 w-28 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-28 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-600/50 cursor-pointer hover:border-blue-500/70 transition-all duration-300 group shadow-lg hover:scale-105"
                                onClick={() => setMainView("local")}
                            >
                                <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-1 rounded text-xs font-medium">
                                    You
                                </div>
                                {!cameraOn && (
                                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                        <VideoOff className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Controls */}
                        <div className="absolute bottom-0 lg:bottom-6 left-1/2 transform -translate-x-1/2">
                            <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                                <button
                                    onClick={toggleMicrophone}
                                    className={`relative p-3 sm:p-4 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${micOn
                                        ? "bg-slate-700/80 hover:bg-slate-600/80 text-white"
                                        : "bg-red-600/90 hover:bg-red-500/90 text-white"
                                        }`}
                                >
                                    {micOn ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    {!micOn && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>

                                <button
                                    onClick={toggleCamera}
                                    className={`relative p-3 sm:p-4 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${cameraOn
                                        ? "bg-slate-700/80 hover:bg-slate-600/80 text-white"
                                        : "bg-red-600/90 hover:bg-red-500/90 text-white"
                                        }`}
                                >
                                    {cameraOn ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    {!cameraOn && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>

                                {!isMobile && (
                                    <button
                                        onClick={toggleScreenShare}
                                        className={`relative p-3 sm:p-4 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${screenShareOn
                                            ? "bg-blue-600/90 hover:bg-blue-500/90 text-white"
                                            : "bg-slate-700/80 hover:bg-slate-600/80 text-white"
                                            }`}
                                    >
                                        <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                                        {screenShareOn && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleEndCall}
                                    className="relative p-3 sm:p-4 rounded-full bg-red-600/90 hover:bg-red-500/90 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg group"
                                >
                                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 rotate-45 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Call Duration */}
                            <div className="text-center mt-4">
                                <div className="inline-flex items-center space-x-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-mono text-slate-300">{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:flex w-64 xl:w-72 bg-black/80 flex-col">
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {/* Remote Camera */}
                            <div
                                className={`relative aspect-video bg-slate-700/50 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group ${mainView === "remote"
                                    ? "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                                    : "border-slate-600/50 hover:border-slate-500"
                                    }`}
                                onClick={() => setMainView("remote")}
                            >
                                <video ref={remoteRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold border border-slate-700/50">
                                    {remoteUserData?.username ? `${remoteUserData?.username}'s Camera` : "Remote Camera"}
                                </div>
                                {mainView === "remote" && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
                                )}
                            </div>

                            {/* Remote Screen Share */}
                            <div
                                className={`relative aspect-video bg-slate-700/50 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group ${mainView === "remoteScreen"
                                    ? "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                                    : "border-slate-600/50 hover:border-slate-500"
                                    } ${!remoteScreenStream ? "opacity-60" : ""}`}
                                onClick={() => {
                                    if (remoteScreenStream) {
                                        setMainView("remoteScreen")
                                    }
                                }}
                            >
                                <video ref={remoteScreenRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold border border-slate-700/50">
                                    {remoteUserData?.username ? `${remoteUserData.username}'s Screen` : "Remote Screen"}
                                </div>
                                {mainView === "remoteScreen" && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
                                )}
                                {!remoteScreenStream && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
                                        <div className="text-center">
                                            <Monitor className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <span className="text-xs text-slate-400 font-medium">No screen share</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Local Screen Share */}
                            {!isMobile && (
                                <div
                                    className={`relative aspect-video bg-slate-700/50 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group ${mainView === "localScreen"
                                        ? "border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                                        : "border-slate-600/50 hover:border-slate-500"
                                        } ${!screenShareOn ? "opacity-60" : ""}`}
                                    onClick={() => {
                                        if (screenShareOn) {
                                            setMainView("localScreen")
                                        }
                                    }}
                                >
                                    <video ref={localScreenRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold border border-slate-700/50">
                                        {localUserData?.username ? `${localUserData.username}'s Screen Share` : "Your Screen"}
                                    </div>
                                    {mainView === "localScreen" && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
                                    )}
                                    {!screenShareOn && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
                                            <div className="text-center">
                                                <Monitor className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <span className="text-xs text-slate-400 font-medium">Not sharing</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}