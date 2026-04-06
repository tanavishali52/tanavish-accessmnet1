'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  addMessage,
  setIsTyping,
  setOnboardPhase,
  setObDone,
  setPendingAutoMessage,
  ChatAttachment,
} from '@/store/chatSlice';
import { showToast } from '@/store/appSlice';
import { motion } from 'framer-motion';
import { apiChatMessage, Model } from '@/lib/api';
import { takeHeroChatFiles } from '@/lib/heroChatBridge';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useTranslation } from 'react-i18next';
import { FiSend, FiMic, FiPaperclip, FiImage, FiX } from 'react-icons/fi';
import { MdKeyboardVoice } from 'react-icons/md';
import ToolbarTooltipButton from '@/components/shared/ToolbarTooltipButton';
import { CatalogIcon } from '@/components/shared/CatalogIcon';
import Skeleton from '@/components/shared/Skeleton';

const getCategoryTabs = (t: any) => [
  { id: 'usecases', tabIcon: 'FiZap', label: t('chat.area.modes.usecases'), prompts: [t('chat.area.suggestions.summarise'), t('chat.area.suggestions.product_desc'), t('chat.area.suggestions.content_calendar'), t('chat.area.suggestions.pro_email')] },
  { id: 'code',     tabIcon: 'FiCode', label: t('chat.area.modes.code'),      prompts: ['Review my code for bugs', 'Write unit tests', 'Explain this algorithm', 'Optimise this SQL query'] },
  { id: 'analyze',  tabIcon: 'FiBarChart2', label: t('chat.area.modes.analyze'),   prompts: ['Analyze this dataset', 'Find patterns in this data', 'Compare these two approaches', 'Create a SWOT analysis'] },
  { id: 'create',   tabIcon: 'FiEdit3', label: t('chat.area.modes.create'),    prompts: ['Write a blog post about', 'Create social media captions', 'Draft a press release', 'Write ad copy for'] },
  { id: 'learn',    tabIcon: 'FiBookOpen', label: t('chat.area.modes.learn'),     prompts: ['Explain quantum computing', 'Teach me about transformers', 'What is RAG in AI?', 'How does RLHF work?'] },
];

export default function ChatInput() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { obDone, currentModelId, userGoal, userAudience, userLevel, userBudget, pendingAutoMessage } = useSelector(
    (s: RootState) => s.chat,
  );
  const { saveMessageToDb } = useChatPersistence();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [activeCat, setActiveCat] = useState('usecases');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTypingActive, setVoiceTypingActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const { items: catalog, status: catalogStatus } = useSelector((s: RootState) => s.models);
  const currentModel = catalog.find((m) => m.id === currentModelId);
  const catalogPending =
    catalogStatus === 'loading' || (catalogStatus === 'idle' && catalog.length === 0);

  const CATEGORY_TABS = getCategoryTabs(t);

  const MAX_ATTACHMENTS = 6;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const pickFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const picked = Array.isArray(files) ? files : Array.from(files);
    if (picked.length === 0) return;
    const tooLarge = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      dispatch(showToast(`"${tooLarge.name}" is too large (max 10MB).`));
      return;
    }

    setAttachments((prev) => {
      const map = new Map(prev.map((a) => [`${a.name}-${a.size}-${a.type}`, a]));
      const newAttachments: ChatAttachment[] = [];
      for (const f of picked) {
        const key = `${f.name}-${f.size}-${f.type}`;
        if (!map.has(key)) {
          const attachment = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: f.name,
            size: f.size,
            type: f.type || 'application/octet-stream',
          };
          map.set(key, attachment);
          newAttachments.push(attachment);
        }
      }
      const next = Array.from(map.values()).slice(0, MAX_ATTACHMENTS);
      return next;
    });

    setAttachmentFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.type}`));
      const newFiles = picked.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.type}`));
      return [...prev, ...newFiles].slice(0, MAX_ATTACHMENTS);
    });

    if (picked.length + attachments.length > MAX_ATTACHMENTS) {
      dispatch(showToast(`Up to ${MAX_ATTACHMENTS} files can be attached.`));
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setAttachmentFiles((prev) => {
      const attachment = attachments.find((a) => a.id === id);
      if (attachment) {
        return prev.filter((f) => 
          !(f.name === attachment.name && f.size === attachment.size && f.type === attachment.type)
        );
      }
      return prev;
    });
  };

  const stopVoiceTyping = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setVoiceTypingActive(false);
  }, []);

  const startVoiceRecording = async () => {
    stopVoiceTyping();
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      dispatch(showToast('Voice recording is not supported in this browser.'));
      return;
    }

    if (!window.MediaRecorder) {
      dispatch(showToast('Audio recording is not supported in this browser.'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const fileExtension = mediaRecorder.mimeType?.includes('webm') ? 'webm' : 
                             mediaRecorder.mimeType?.includes('mp4') ? 'mp4' : 'webm';
        const audioFile = new File([audioBlob], `voice-${Date.now()}.${fileExtension}`, { 
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        
        // Add the audio file to attachments
        pickFiles([audioFile]);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        dispatch(showToast('Voice recording saved as attachment'));
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        dispatch(showToast('Recording failed'));
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      dispatch(showToast('Recording... Tap the mic button again to stop'));
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          dispatch(showToast('Microphone access denied. Please allow microphone access.'));
        } else if (error.name === 'NotFoundError') {
          dispatch(showToast('No microphone found.'));
        } else {
          dispatch(showToast('Could not start recording. Please check your microphone.'));
        }
      } else {
        dispatch(showToast('Could not access microphone. Please check permissions.'));
      }
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      dispatch(showToast('Recording stopped'));
    }
  };

  const toggleVoiceTyping = useCallback(() => {
    if (voiceTypingActive) {
      stopVoiceTyping();
      return;
    }
    if (isRecording) {
      stopVoiceRecording();
    }
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      dispatch(showToast('Voice typing is not supported in this browser.'));
      return;
    }
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0]?.transcript ?? '')
          .join('');
        setText(transcript);
      };
      recognition.onerror = () => {
        setVoiceTypingActive(false);
        recognitionRef.current = null;
      };
      recognition.onend = () => {
        setVoiceTypingActive(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      setVoiceTypingActive(true);
      dispatch(showToast('Voice typing… speak to fill the message'));
    } catch {
      setVoiceTypingActive(false);
      dispatch(showToast('Could not start voice typing.'));
    }
  }, [voiceTypingActive, isRecording, stopVoiceTyping, dispatch]);

  useEffect(() => {
    return () => {
      // Cleanup media recorder on unmount
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const handleSend = useCallback(async (textOverride?: string, heroAttachmentFiles?: File[]) => {
    const fromOverride = textOverride !== undefined;
    const hasHeroFiles = Boolean(heroAttachmentFiles && heroAttachmentFiles.length > 0);
    const tVal = (fromOverride ? String(textOverride).trim() : text.trim());
    let attachSnap: ChatAttachment[];
    let filesSnap: File[];
    if (fromOverride && !hasHeroFiles) {
      attachSnap = [];
      filesSnap = [];
    } else if (hasHeroFiles) {
      filesSnap = [...heroAttachmentFiles!];
      attachSnap = filesSnap.map((f, i) => ({
        id: `local_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
      }));
    } else {
      attachSnap = [...attachments];
      filesSnap = [...attachmentFiles];
    }
    if (!tVal && attachSnap.length === 0) return;
    const payloadText = tVal || `Attached ${attachSnap.length} file${attachSnap.length > 1 ? 's' : ''}`;
    const filesSnapshot = filesSnap;
    const attachmentsSnapshot = attachSnap;
    const userMessageId = `local_${Date.now()}`;

    dispatch(addMessage({
      id: userMessageId,
      role: 'user',
      content: payloadText,
      attachments: attachmentsSnapshot.length > 0 ? attachmentsSnapshot : undefined,
      timestamp: Date.now(),
    }));
    setText('');
    setAttachments([]);
    setAttachmentFiles([]);
    dispatch(setIsTyping(true));
    if (!obDone) { dispatch(setOnboardPhase('chat')); dispatch(setObDone(true)); }

    await saveMessageToDb({
      id: userMessageId,
      role: 'user',
      content: payloadText,
      attachments: attachmentsSnapshot.length > 0 ? attachmentsSnapshot : undefined,
    });

    const context = userGoal || userAudience || userLevel || userBudget
      ? { goal: userGoal || undefined, audience: userAudience || undefined, level: userLevel || undefined, budget: userBudget || undefined }
      : undefined;

    try {
      const reply = await apiChatMessage(
        payloadText,
        context,
        filesSnapshot.length > 0 ? filesSnapshot : undefined,
      );
      const recs = (reply.recs as Model[]).map((r) => {
        const local = catalog.find((m) => m.id === r.id);
        return local ?? r;
      }) as Model[];
      dispatch(setIsTyping(false));
      const aiMessageId = `local_${Date.now() + 1}`;
      const aiAttachments = reply.attachments?.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        type: a.type,
        url: a.url,
      }));
      dispatch(addMessage({
        id: aiMessageId,
        role: 'ai',
        content: reply.text,
        recs,
        attachments: aiAttachments && aiAttachments.length > 0 ? aiAttachments : undefined,
        timestamp: Date.now() + 1,
      }));
      await saveMessageToDb({
        id: aiMessageId,
        role: 'ai',
        content: reply.text,
        recs,
        attachments: aiAttachments && aiAttachments.length > 0 ? aiAttachments : undefined,
      });
    } catch (error) {
      dispatch(setIsTyping(false));
      console.error('Chat error:', error);
      const errorMessageId = `local_${Date.now() + 1}`;
      dispatch(addMessage({ id: errorMessageId, role: 'ai', content: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() + 1 }));
    }
  }, [text, attachments, attachmentFiles, dispatch, obDone, userGoal, userAudience, userLevel, userBudget, catalog, saveMessageToDb]);

  useEffect(() => {
    if (!pendingAutoMessage?.trim()) return;
    const msg = pendingAutoMessage.trim();
    const heroFiles = takeHeroChatFiles();
    dispatch(setPendingAutoMessage(null));
    void handleSend(msg, heroFiles.length > 0 ? heroFiles : undefined);
  }, [pendingAutoMessage, dispatch, handleSend]);

  return (
    <div className="bg-white border-t border-black/[0.08] flex-shrink-0">
      {/* Category Prompt Panel */}
      <div className="border-t border-black/[0.08]">
        {/* Scrollable tabs */}
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-2 overflow-x-auto scrollbar-none">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 border-[1.5px] rounded-full text-[0.72rem] sm:text-[0.77rem] font-medium cursor-pointer whitespace-nowrap flex-shrink-0 transition-all font-instrument ${
                activeCat === cat.id
                  ? 'bg-text1 border-text1 text-white'
                  : 'bg-none border-black/[0.14] text-text2 hover:border-accent hover:text-accent'
              }`}
            >
              <CatalogIcon name={cat.tabIcon} size={14} className={activeCat === cat.id ? 'text-white' : 'text-accent'} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompt grid — 1 col on mobile, 2 on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 px-3 sm:px-4 py-1.5 gap-0.5">
          {CATEGORY_TABS.find((c) => c.id === activeCat)?.prompts.map((p) => (
            <button
              key={p}
              onClick={() => { setText(p); textareaRef.current?.focus(); }}
              className="flex items-start px-2 py-1.5 rounded-sm text-[0.73rem] sm:text-[0.77rem] text-text2 bg-none border-none text-left cursor-pointer hover:bg-bg2 hover:text-text1 transition-all leading-[1.35] font-instrument"
              style={{ borderRadius: 8 }}
            >
              <span className="w-1 h-1 bg-text3 rounded-full inline-block mr-2 mt-1.5 flex-shrink-0" />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end px-3 sm:px-5 py-2.5 sm:py-3">
        <div
          className="flex-1 bg-bg border-[1.5px] border-black/[0.14] overflow-visible focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(200,98,42,0.08)] transition-all"
          style={{ borderRadius: 12 }}
        >
          {attachments.length > 0 && (
            <div className="px-2.5 sm:px-3 pt-2 flex flex-wrap gap-1.5">
              {attachments.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 bg-white border border-black/[0.12] rounded-full px-2 py-1 text-[0.68rem] text-text2 font-instrument max-w-full"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[220px]">{a.name}</span>
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-bg2 border-none bg-none text-text3 cursor-pointer"
                    aria-label={`Remove ${a.name}`}
                  >
                    <FiX size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            placeholder={t('chat.area.placeholder')}
            rows={1}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-[0.82rem] sm:text-[0.875rem] bg-transparent border-none outline-none resize-none text-text1 placeholder:text-text3 font-instrument"
            style={{ minHeight: 40, maxHeight: 120 }}
          />
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border-t border-black/[0.08]">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                pickFiles(e.target.files);
                e.currentTarget.value = '';
              }}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                pickFiles(e.target.files);
                e.currentTarget.value = '';
              }}
            />
            <ToolbarTooltipButton
              tooltip={t('common.tooltips.voice_record')}
              onClick={() => {
                if (isRecording) stopVoiceRecording();
                else void startVoiceRecording();
              }}
              className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all border-none cursor-pointer ${
                isRecording
                  ? 'bg-red-50 text-red-500 animate-pulse'
                  : 'bg-violet-100/90 text-violet-700 hover:bg-violet-100'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Record voice'}
            >
              <FiMic size={14} />
            </ToolbarTooltipButton>
            <ToolbarTooltipButton
              tooltip={t('common.tooltips.attach_file')}
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-amber-900 transition-all border-none cursor-pointer bg-amber-50/95 hover:bg-amber-100"
              aria-label="Attach files"
            >
              <FiPaperclip size={14} />
            </ToolbarTooltipButton>
            <ToolbarTooltipButton
              tooltip={t('common.tooltips.attach_image')}
              onClick={() => imageInputRef.current?.click()}
              className="hidden sm:inline-flex w-7 h-7 rounded-[6px] items-center justify-center text-sky-800 transition-all border-none cursor-pointer bg-sky-50/95 hover:bg-sky-100"
              aria-label="Attach images"
            >
              <FiImage size={14} />
            </ToolbarTooltipButton>
            <ToolbarTooltipButton
              tooltip={t('common.tooltips.voice_typing')}
              onClick={() => toggleVoiceTyping()}
              className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all border-none cursor-pointer ${
                voiceTypingActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
              aria-label={voiceTypingActive ? 'Stop voice typing' : 'Voice typing'}
            >
              <MdKeyboardVoice size={16} />
            </ToolbarTooltipButton>
            <div className="relative group ml-auto flex items-center gap-1 text-[0.68rem] sm:text-[0.72rem] text-text3 cursor-pointer hover:text-text1 transition-colors truncate max-w-[120px] sm:max-w-none">
              {catalogPending && !currentModel ? (
                <>
                  <Skeleton width={14} height={14} borderRadius={4} className="shrink-0" />
                  <Skeleton width={72} height="0.7rem" className="max-w-[45%]" />
                </>
              ) : (
                <>
                  <CatalogIcon name={currentModel?.icon ?? 'FiCpu'} size={14} className="text-text3 shrink-0" />
                  <span className="truncate">{currentModel?.name ?? '—'}</span>
                  <span>▾</span>
                </>
              )}
              <span
                role="tooltip"
                className="pointer-events-auto absolute bottom-full right-0 z-30 mb-1.5 cursor-default select-none rounded-full bg-neutral-900 px-2.5 py-1 text-[0.7rem] font-semibold leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 whitespace-nowrap"
                onPointerDown={(e) => e.preventDefault()}
              >
                {t('common.tooltips.active_model')}
              </span>
            </div>
          </div>
        </div>
        <span className="relative inline-flex group flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => void handleSend()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent2 transition-colors border-none cursor-pointer"
            aria-label={t('common.tooltips.send_message')}
          >
            <FiSend size={15} />
          </motion.button>
          <span
            role="tooltip"
            className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 cursor-default select-none rounded-full bg-neutral-900 px-2.5 py-1 text-[0.7rem] font-semibold leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 whitespace-nowrap"
            onPointerDown={(e) => e.preventDefault()}
          >
            {t('common.tooltips.send_message')}
          </span>
        </span>
      </div>
    </div>
  );
}
