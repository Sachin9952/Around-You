import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineFaceSmile,
  HiOutlinePaperClip,
  HiPaperAirplane,
  HiXMark,
} from "react-icons/hi2";

/**
 * InputBox — Chat input bar with:
 *  • Auto-expanding textarea (grows up to 5 lines)
 *  • Emoji placeholder icon
 *  • File attachment with preview before sending
 *  • Send button disabled when input is empty
 *  • Keyboard shortcut: Enter to send, Shift+Enter for new line
 *
 * Props:
 *  @param {function} onSend       — (text: string) => void
 *  @param {function} onImageSend  — (file: File) => void
 *  @param {function} onTyping     — () => void (notify parent about typing)
 */
const InputBox = ({ onSend, onImageSend, onTyping }) => {
  const [text, setText] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea to fit content (max ~5 lines ≈ 120px)
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const hasContent = text.trim().length > 0 || attachmentFile;

  const handleSend = () => {
    if (attachmentFile) {
      onImageSend?.(attachmentFile);
      clearAttachment();
    }
    if (text.trim()) {
      onSend?.(text.trim());
    }
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasContent) handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate preview URL
    const previewUrl = URL.createObjectURL(file);
    setAttachmentPreview(previewUrl);
    setAttachmentFile(file);

    // Reset the file input so the same file can be re-selected
    e.target.value = "";
  };

  const clearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachmentPreview(null);
    setAttachmentFile(null);
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
                <img
                  src={attachmentPreview}
                  alt="Attachment preview"
                  className="h-20 w-20 object-cover rounded-xl border border-dark-500/50"
                />
                <button
                  onClick={clearAttachment}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600
                    rounded-full flex items-center justify-center transition-colors shadow-lg"
                  aria-label="Remove attachment"
                >
                  <HiXMark className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        {/* Emoji button (decorative for now) */}
        <button
          className="flex-shrink-0 p-2 text-dark-200 hover:text-primary-400 rounded-xl
            hover:bg-dark-600/60 transition-all duration-200"
          aria-label="Emoji"
          type="button"
        >
          <HiOutlineFaceSmile className="w-5 h-5" />
        </button>

        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-dark-200 hover:text-primary-400 rounded-xl
            hover:bg-dark-600/60 transition-all duration-200"
          aria-label="Attach file"
          type="button"
        >
          <HiOutlinePaperClip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-dark-600/60 border border-dark-500/50 rounded-2xl
            px-4 py-2.5 text-sm text-white placeholder-dark-200/60
            focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/30
            transition-all duration-200 max-h-[120px] scrollbar-thin"
        />

        {/* Send button */}
        <motion.button
          onClick={hasContent ? handleSend : undefined}
          disabled={!hasContent}
          whileTap={hasContent ? { scale: 0.9 } : {}}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200
            ${
              hasContent
                ? "bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 cursor-pointer"
                : "bg-dark-600/40 text-dark-300 cursor-not-allowed"
            }`}
          aria-label="Send message"
          type="button"
        >
          <HiPaperAirplane className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default InputBox;
