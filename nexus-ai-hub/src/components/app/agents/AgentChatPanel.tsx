'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FiArrowLeft,
  FiImage,
  FiMic,
  FiPaperclip,
  FiSend,
  FiSettings,
  FiVideo,
  FiX,
  FiStar,
} from 'react-icons/fi';
import { MdKeyboardVoice } from 'react-icons/md';
import { RootState } from '@/store';
import { type ChatAttachment } from '@/store/chatSlice';
import { showToast } from '@/store/appSlice';
import { apiRunAgent, type AgentRecord } from '@/lib/api';
import ToolbarTooltipButton from '@/components/shared/ToolbarTooltipButton';
import { CatalogIcon } from '@/components/shared/CatalogIcon';

type LocalMsg = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  attachments?: ChatAttachment[];
};

const MAX_ATTACHMENTS = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_AGENT_MESSAGE_CHARS = 30000;

async function buildAugmentedMessage(
  trimmed: string,
  files: File[],
  t: (k: string, o?: Record<string, unknown>) => string,
): Promise<string> {
  const header =
    trimmed ||
    (files.length ? t('agents.chat.attachments_only') : '');
  if (files.length === 0) {
    return header.slice(0, MAX_AGENT_MESSAGE_CHARS);
  }

  const sections: string[] = header ? [header] : [];

  for (const f of files) {
    const meta = `"${f.name}" (${f.type || 'application/octet-stream'}, ${(f.size / 1024).toFixed(1)} KB)`;
    if (f.type.startsWith('audio/')) {
      sections.push(
        `[Voice / audio] ${meta}\n${t('agents.chat.prompt_voice_note')}`,
      );
      continue;
    }
    if (f.type.startsWith('video/')) {
      sections.push(`[Video] ${meta}\n${t('agents.chat.prompt_video_note')}`);
      continue;
    }
    if (
      f.type.startsWith('text/') ||
      /\.(txt|md|csv|json|xml|log|tsv|html)$/i.test(f.name)
    ) {
      try {
        const body = await f.text();
        sections.push(`[File ${meta}]\n${body.slice(0, 14000)}`);
      } catch {
        sections.push(`[File ${meta}] (${t('agents.chat.file_read_error')})`);
      }
      continue;
    }
    if (f.type.startsWith('image/')) {
      sections.push(`[Image] ${meta}\n${t('agents.chat.prompt_image_note')}`);
      continue;
    }
    sections.push(`[Attachment] ${meta}`);
  }

  return sections.filter(Boolean).join('\n\n---\n').slice(0, MAX_AGENT_MESSAGE_CHARS);
}

export default function AgentChatPanel({
  agent,
  onBack,
  onOpenSettings,
  initialOutboundMessage = null,
  onInitialOutboundConsumed,
}: {
  agent: AgentRecord;
  onBack: () => void;
  onOpenSettings: () => void;
  /** When set (e.g. from Agents hub search), sent automatically after the welcome message. */
  initialOutboundMessage?: string | null;
  onInitialOutboundConsumed?: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const models = useSelector((s: RootState) => s.models.items);
  const [messages, setMessages] = useState<LocalMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTypingActive, setVoiceTypingActive] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const sessionInitDoneRef = useRef(false);

  const model = models.find((m) => m.id === agent.modelId);

  const tryPrompts = [
    t('agents.chat.try_1'),
    t('agents.chat.try_2'),
    t('agents.chat.try_3'),
    t('agents.chat.try_4'),
    t('agents.chat.try_5'),
  ];

  const toolsLine =
    agent.tools?.length > 0
      ? agent.tools.map((x) => x.replace(/_/g, ' ')).join(', ')
      : t('agents.chat.tools_none');

  useEffect(() => {
    sessionInitDoneRef.current = false;
  }, [agent._id]);

  useEffect(() => {
    if (sessionInitDoneRef.current) return;

    const welcomeMsg: LocalMsg = {
      id: `w-${agent._id}`,
      role: 'ai',
      content: t('agents.chat.welcome', { name: agent.name }),
      timestamp: Date.now(),
    };

    const outbound = initialOutboundMessage?.trim();
    if (outbound) {
      sessionInitDoneRef.current = true;
      onInitialOutboundConsumed?.();
      const userMsg: LocalMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: outbound,
        timestamp: Date.now(),
      };
      setMessages([welcomeMsg, userMsg]);
      setText('');
      setAttachments([]);
      setAttachmentFiles([]);
      setSending(true);
      void (async () => {
        try {
          const result = await apiRunAgent(agent._id, outbound);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'ai',
              content: result.output,
              timestamp: Date.now(),
            },
          ]);
        } catch {
          dispatch(showToast(t('agents.chat.send_error')));
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'ai',
              content: t('agents.chat.error_reply'),
              timestamp: Date.now(),
            },
          ]);
        } finally {
          setSending(false);
        }
      })();
      return;
    }

    sessionInitDoneRef.current = true;
    setMessages([welcomeMsg]);
    setText('');
    setAttachments([]);
    setAttachmentFiles([]);
  }, [
    agent._id,
    agent.name,
    initialOutboundMessage,
    t,
    dispatch,
    onInitialOutboundConsumed,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      mediaRecorderRef.current?.stop?.();
    };
  }, []);

  const stopVoiceTyping = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setVoiceTypingActive(false);
  }, []);

  const pickFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const picked = Array.isArray(files) ? files : Array.from(files);
    if (picked.length === 0) return;
    const tooLarge = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      dispatch(showToast(t('agents.chat.file_too_large', { name: tooLarge.name })));
      return;
    }

    setAttachments((prev) => {
      const map = new Map(prev.map((a) => [`${a.name}-${a.size}-${a.type}`, a]));
      const nextAtt: ChatAttachment[] = [];
      for (const f of picked) {
        const key = `${f.name}-${f.size}-${f.type}`;
        if (!map.has(key)) {
          const attachment: ChatAttachment = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: f.name,
            size: f.size,
            type: f.type || 'application/octet-stream',
          };
          map.set(key, attachment);
          nextAtt.push(attachment);
        }
      }
      return Array.from(map.values()).slice(0, MAX_ATTACHMENTS);
    });

    setAttachmentFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.type}`));
      const newFiles = picked.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.type}`));
      return [...prev, ...newFiles].slice(0, MAX_ATTACHMENTS);
    });

    if (picked.length + attachmentFiles.length > MAX_ATTACHMENTS) {
      dispatch(showToast(t('agents.chat.max_attachments', { n: MAX_ATTACHMENTS })));
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prevAtt) => {
      const removed = prevAtt.find((a) => a.id === id);
      if (removed) {
        setAttachmentFiles((files) =>
          files.filter(
            (f) => !(f.name === removed.name && f.size === removed.size && f.type === removed.type),
          ),
        );
      }
      return prevAtt.filter((a) => a.id !== id);
    });
  };

  const startVoiceRecording = async () => {
    stopVoiceTyping();
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch(showToast(t('agents.chat.record_unsupported')));
      return;
    }
    if (!window.MediaRecorder) {
      dispatch(showToast(t('agents.chat.recorder_unsupported')));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';
        }
      }
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        const ext = mediaRecorder.mimeType?.includes('webm')
          ? 'webm'
          : mediaRecorder.mimeType?.includes('mp4')
            ? 'mp4'
            : 'webm';
        const audioFile = new File([audioBlob], `voice-${Date.now()}.${ext}`, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        pickFiles([audioFile]);
        stream.getTracks().forEach((track) => track.stop());
        dispatch(showToast(t('agents.chat.voice_saved_attach')));
      };
      mediaRecorder.onerror = () => {
        dispatch(showToast(t('agents.chat.record_failed')));
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      dispatch(showToast(t('agents.chat.recording_hint')));
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        dispatch(showToast(t('agents.chat.mic_denied')));
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        dispatch(showToast(t('agents.chat.mic_missing')));
      } else {
        dispatch(showToast(t('agents.chat.mic_error')));
      }
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      dispatch(showToast(t('agents.chat.recording_stopped')));
    }
  };

  const toggleVoiceTyping = useCallback(() => {
    if (voiceTypingActive) {
      stopVoiceTyping();
      return;
    }
    if (isRecording) stopVoiceRecording();

    const SpeechRecognitionAPI = (window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      || (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      dispatch(showToast(t('agents.chat.voice_type_unsupported')));
      return;
    }
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = navigator.language || 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0]?.transcript ?? '')
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
      dispatch(showToast(t('agents.chat.voice_typing_on')));
    } catch {
      setVoiceTypingActive(false);
      dispatch(showToast(t('agents.chat.voice_typing_fail')));
    }
  }, [voiceTypingActive, isRecording, stopVoiceTyping, dispatch, t]);

  const appendAi = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, role: 'ai', content, timestamp: Date.now() },
    ]);
  };

  const sendMessage = async () => {
    if (sending) return;
    const trimmed = text.trim();
    if (!trimmed && attachmentFiles.length === 0) return;

    const userDisplay =
      trimmed ||
      t('agents.chat.n_files_attached', { count: attachmentFiles.length });
    const userAttachments = attachments.length > 0 ? [...attachments] : undefined;

    const filesSnapshot = [...attachmentFiles];
    const attachSnap = userAttachments ? [...userAttachments] : undefined;

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: 'user',
        content: userDisplay,
        timestamp: Date.now(),
        attachments: attachSnap,
      },
    ]);

    setText('');
    setAttachments([]);
    setAttachmentFiles([]);
    setSending(true);

    try {
      const payload = await buildAugmentedMessage(trimmed, filesSnapshot, t);
      const result = await apiRunAgent(agent._id, payload);
      appendAi(result.output);
    } catch {
      dispatch(showToast(t('agents.chat.send_error')));
      appendAi(t('agents.chat.error_reply'));
    } finally {
      setSending(false);
    }
  };

  const live = agent.status === 'active';
  const canSend = !sending && (Boolean(text.trim()) || attachmentFiles.length > 0);

  return (
    <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden bg-bg">
      <header className="shrink-0 bg-white border-b border-black/[0.08] px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-[0.78rem] sm:text-[0.8rem] text-text2 hover:text-accent border border-black/[0.1] rounded-full px-2.5 py-1.5 bg-bg shrink-0 cursor-pointer font-instrument mt-0.5"
            >
              <FiArrowLeft size={14} /> {t('agents.chat.back_agents')}
            </button>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border border-black/[0.06] text-text1"
              style={{ background: model?.bg ?? '#FDF1EB' }}
            >
              <CatalogIcon name={model?.icon ?? 'FiCpu'} size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-syne font-bold text-text1 text-[0.95rem] sm:text-[1.05rem] tracking-tight truncate">
                  {agent.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.68rem] font-semibold rounded-full px-2 py-0.5 ${
                    live ? 'bg-green/15 text-green' : 'bg-amber/15 text-amber'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green' : 'bg-amber'}`} />
                  {live ? t('agents.chat.live') : t('agents.chat.draft')}
                </span>
              </div>
              <p className="text-[0.68rem] sm:text-[0.72rem] text-text3 mt-0.5 leading-snug">
                {t('agents.chat.meta_tools', { tools: toolsLine })}
                <span className="text-text3/80"> · </span>
                {t('agents.chat.meta_memory')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="self-end sm:self-center flex items-center gap-1.5 text-[0.78rem] text-text2 border border-black/[0.12] rounded-full px-3 py-1.5 hover:border-accent hover:text-accent bg-white cursor-pointer font-instrument shrink-0"
          >
            <FiSettings size={15} /> {t('agents.chat.settings')}
          </button>
        </div>
      </header>

      <div className="shrink-0 bg-white border-b border-black/[0.08] px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x pb-0.5 max-w-4xl mx-auto">
          <span className="text-[0.68rem] font-bold text-text3 uppercase tracking-wider shrink-0">{t('agents.chat.try_label')}</span>
          {tryPrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setText(p);
                textareaRef.current?.focus();
              }}
              className="snap-start shrink-0 rounded-full border border-black/[0.1] bg-bg px-2.5 py-1 text-[0.72rem] sm:text-[0.75rem] text-text2 hover:border-accent hover:text-accent cursor-pointer font-instrument whitespace-nowrap max-w-[220px] truncate"
              title={p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 overscroll-contain">
        <div className="max-w-[680px] mx-auto w-full flex flex-col gap-3 sm:gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 sm:gap-2.5 max-w-full w-full ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 mt-0.5 ${
                  msg.role === 'user' ? 'bg-accent text-white' : 'bg-accent-lt text-accent border border-accent/25'
                }`}
              >
                {msg.role === 'user' ? t('agents.chat.avatar_user') : <FiStar size={12} strokeWidth={2.5} aria-hidden />}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 text-[0.82rem] sm:text-[0.875rem] leading-[1.65] break-words whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-xl rounded-br-sm'
                      : 'bg-white border border-black/[0.08] rounded-xl rounded-bl-sm text-text1'
                  }`}
                  style={{ borderRadius: 12 }}
                >
                  {msg.content}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`mt-1.5 flex flex-wrap gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.attachments.map((file) => (
                      <div
                        key={file.id}
                        className={`px-2.5 py-1.5 rounded-full text-[0.68rem] font-instrument border max-w-[240px] truncate ${
                          msg.role === 'user'
                            ? 'bg-white/15 border-white/25 text-white'
                            : 'bg-bg border-black/[0.12] text-text2'
                        }`}
                        title={file.name}
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="self-start flex gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-lt border border-accent/25 flex items-center justify-center flex-shrink-0 text-accent">
                <FiStar size={12} strokeWidth={2.5} aria-hidden />
              </div>
              <div className="px-4 py-3 bg-white border border-black/[0.08] rounded-xl text-[0.8rem] text-text3 font-instrument">
                {t('agents.chat.thinking')}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-black/[0.08]">
        <div className="flex gap-2 items-end px-3 sm:px-5 py-2.5 sm:py-3 max-w-4xl mx-auto w-full">
          <div
            className="flex-1 bg-bg border-[1.5px] border-black/[0.14] overflow-visible focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(200,98,42,0.08)] transition-all min-w-0"
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
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-bg2 border-none bg-transparent text-text3 cursor-pointer"
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
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder={t('agents.chat.input_placeholder')}
              rows={1}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-[0.82rem] sm:text-[0.875rem] bg-transparent border-none outline-none resize-none text-text1 placeholder:text-text3 font-instrument max-h-[120px]"
              style={{ minHeight: 44 }}
            />
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border-t border-black/[0.08] flex-wrap">
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
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  pickFiles(e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              <ToolbarTooltipButton
                tooltip={t('common.tooltips.voice_typing')}
                onClick={() => toggleVoiceTyping()}
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all border-none cursor-pointer ${
                  voiceTypingActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-violet-100/90 text-violet-800 hover:bg-violet-100'
                }`}
                aria-label={t('common.tooltips.voice_typing')}
              >
                <MdKeyboardVoice size={16} />
              </ToolbarTooltipButton>
              <ToolbarTooltipButton
                tooltip={t('common.tooltips.voice_record')}
                onClick={() => {
                  if (isRecording) stopVoiceRecording();
                  else void startVoiceRecording();
                }}
                className={`w-7 h-7 rounded-[6px] flex items-center justify-center transition-all border-none cursor-pointer ${
                  isRecording
                    ? 'bg-red-50 text-red-500 animate-pulse'
                    : 'bg-bg2 text-text1 hover:bg-black/[0.06]'
                }`}
                aria-label={isRecording ? t('agents.chat.stop_recording') : t('common.tooltips.voice_record')}
              >
                <FiMic size={14} />
              </ToolbarTooltipButton>
              <ToolbarTooltipButton
                tooltip={t('agents.chat.video')}
                onClick={() => videoInputRef.current?.click()}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-sky-50 text-sky-800 hover:bg-sky-100 border-none cursor-pointer"
                aria-label={t('agents.chat.video')}
              >
                <FiVideo size={14} />
              </ToolbarTooltipButton>
              <ToolbarTooltipButton
                tooltip={t('common.tooltips.attach_file')}
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-amber-50/95 text-amber-900 hover:bg-amber-100 border-none cursor-pointer"
                aria-label={t('common.tooltips.attach_file')}
              >
                <FiPaperclip size={14} />
              </ToolbarTooltipButton>
              <ToolbarTooltipButton
                tooltip={t('agents.chat.palette')}
                onClick={() => dispatch(showToast(t('agents.chat.prompt_tip_toast')))}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-rose-50 text-rose-800 hover:bg-rose-100 border-none cursor-pointer"
                aria-label={t('agents.chat.palette')}
              >
                <FiStar size={13} strokeWidth={2} aria-hidden />
              </ToolbarTooltipButton>
              <ToolbarTooltipButton
                tooltip={t('common.tooltips.attach_image')}
                onClick={() => imageInputRef.current?.click()}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-none cursor-pointer"
                aria-label={t('common.tooltips.attach_image')}
              >
                <FiImage size={14} />
              </ToolbarTooltipButton>
              <div className="ml-auto flex items-center gap-1 text-[0.68rem] sm:text-[0.72rem] text-text3 truncate max-w-[100px] sm:max-w-[140px]">
                <CatalogIcon name={model?.icon ?? 'FiCpu'} size={14} className="text-text3 shrink-0" />
                <span className="truncate">{model?.name ?? agent.modelId}</span>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!canSend}
            onClick={() => void sendMessage()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent2 transition-colors border-none cursor-pointer disabled:opacity-45 shrink-0"
            aria-label={t('common.tooltips.send_message')}
          >
            <FiSend size={16} />
          </motion.button>
        </div>
        <p className="text-center text-[0.68rem] text-text3 pb-2.5 px-3 font-instrument">
          {t('agents.chat.footer_preview')}{' '}
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-accent font-semibold hover:underline bg-transparent border-none cursor-pointer p-0 font-instrument"
          >
            {t('agents.chat.edit_config')}
          </button>
        </p>
      </div>
    </div>
  );
}

// SpeechRecognition types (browser)
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
}
