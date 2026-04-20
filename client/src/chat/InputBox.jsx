import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePaperClip,
  HiPaperAirplane,
  HiXMark,
  HiOutlineMicrophone,
  HiStop
} from "react-icons/hi2";

const InputBox = ({ onSend, onAttachmentSend, onTyping }) => {
  const [text, setText] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Auto-resize textarea to fit content
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => { adjustHeight(); }, [text, adjustHeight]);

  const hasContent = text.trim().length > 0 || attachmentFile;

  const handleSend = () => {
    if (attachmentFile) {
      let type = 'image';
      if (attachmentFile.type === 'application/pdf') type = 'pdf';
      else if (attachmentFile.type.startsWith('audio/')) type = 'voice';
      
      onAttachmentSend?.(attachmentFile, type);
      clearAttachment();
    }
    if (text.trim()) {
      onSend?.(text.trim());
    }
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasContent) handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      setAttachmentPreview("/pdf-icon.png"); 
    } else {
      setAttachmentPreview(URL.createObjectURL(file));
    }
    setAttachmentFile(file);
    e.target.value = "";
  };

  const clearAttachment = () => {
    if (attachmentPreview && attachmentPreview !== "/pdf-icon.png") {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachmentPreview(null);
    setAttachmentFile(null);
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: 'audio/webm' });
        
        // Stop auto-sending. Instead, set it as an attachment for review/manual sending.
        setAttachmentFile(audioFile);
        setAttachmentPreview("voice_preview"); // Special flag for voice preview UI
        clearTimer();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const clearTimer = () => {
    clearInterval(recordingTimerRef.current);
    setRecordingTime(0);
  };

  return (
    <div className="border-t border-dark-500/60 bg-dark-800/95 backdrop-blur-md">
      {/* Attachment preview */}
      <AnimatePresence>
        {attachmentPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-1">
              <div className="relative inline-block">
                {attachmentFile?.type === "application/pdf" ? (
                  <div className="h-20 w-20 flex items-center justify-center bg-gray-700 rounded-xl border border-dark-500/50">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                ) : attachmentPreview === "voice_preview" ? (
                  <div className="h-20 w-20 flex flex-col items-center justify-center bg-primary-500/20 rounded-xl border border-primary-500/30 text-primary-400">
                    <HiOutlineMicrophone className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Voice</span>
                  </div>
                ) : (
                  <img src={attachmentPreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-dark-500/50" />
                )}
                <button
                  onClick={clearAttachment}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <HiXMark className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5 sm:px-4 sm:py-3 relative">
        {isRecording ? (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-medium tracking-widest text-sm">
              00:{recordingTime.toString().padStart(2, '0')}
            </span>
          </motion.div>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-dark-200 hover:text-primary-400 rounded-xl hover:bg-dark-600/60 transition-all duration-200"
              type="button"
            >
              <HiOutlinePaperClip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => { setText(e.target.value); onTyping?.(); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 resize-none bg-dark-600/60 border border-dark-500/50 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-dark-200/60 focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 max-h-[120px] scrollbar-thin"
            />
          </>
        )}

        {/* Send or Mic button */}
        {hasContent ? (
          <motion.button
            onClick={handleSend}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg cursor-pointer"
            type="button"
            aria-label="Send message"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </motion.button>
        ) : isRecording ? (
          <motion.button
            onClick={stopRecording}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 bg-red-500/20 text-red-500 hover:bg-red-500/30 cursor-pointer"
            type="button"
          >
            <HiStop className="w-6 h-6 animate-pulse" />
          </motion.button>
        ) : (
          <motion.button
            onClick={startRecording}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 bg-dark-600/40 text-dark-200 hover:text-white cursor-pointer"
            type="button"
          >
            <HiOutlineMicrophone className="w-6 h-6" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default InputBox;
