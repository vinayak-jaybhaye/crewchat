export async function requestCameraAndMicrophoneAccess(): Promise<boolean> {
    try {
        console.log('Requesting camera and microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        console.error('Camera/Mic access denied or error:', error);
        return false;
    }
}


export async function requestMicrophoneAccess(): Promise<boolean> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after access
        return true;
    } catch (error) {
        console.error('Microphone access denied or error:', error);
        return false;
    }
}
