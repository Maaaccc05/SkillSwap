import React, { useEffect, useRef, useState } from "react";
import Daily from "@daily-co/daily-js";
import { FaVideoSlash, FaVideo, FaMicrophone, FaMicrophoneSlash, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

export default function VideoRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const callRef = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const call = Daily.createCallObject();
    callRef.current = call;

    const join = async () => {
      await call.join({ url: `https://your-subdomain.daily.co/${roomId}` });
    };

    call.on("track-started", (ev) => {
      if (ev.participant.local) {
        localVideo.current.srcObject = ev.track.kind === "video" ? ev.track : localVideo.current.srcObject;
      } else {
        remoteVideo.current.srcObject = ev.track.kind === "video" ? ev.track : remoteVideo.current.srcObject;
      }
    });

    join();
    return () => call.leave();
  }, [roomId]);

  const toggleCam = () => {
    callRef.current.setLocalVideo(camOn ? false : true);
    setCamOn((v) => !v);
  };
  const toggleMic = () => {
    callRef.current.setLocalAudio(micOn ? false : true);
    setMicOn((v) => !v);
  };

  const leaveRoom = () => {
    callRef.current.leave();
    navigate("/");
  };

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <div className="flex gap-4 w-full max-w-5xl">
        <video ref={localVideo} autoPlay playsInline muted className="w-1/2 aspect-video bg-black rounded-lg" />
        <video ref={remoteVideo} autoPlay playsInline className="w-1/2 aspect-video bg-black rounded-lg" />
      </div>

      <div className="mt-6 flex gap-6">
        <button onClick={toggleCam} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
          {camOn ? <FaVideo size={18} /> : <FaVideoSlash size={18} />}
        </button>
        <button onClick={toggleMic} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
          {micOn ? <FaMicrophone size={18} /> : <FaMicrophoneSlash size={18} />}
        </button>
        <button onClick={leaveRoom} className="p-3 bg-red-600 rounded-full hover:bg-red-700">
          <FaSignOutAlt size={18} />
        </button>
      </div>
    </div>
  );
}