import React, { useState, useRef } from 'react';
import { usePlatformStore } from '../../store/usePlatformStore';
import {
  FileText,
  Link2,
  Send,
  X,
  ArrowUpRight,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Bot,
  User
} from 'lucide-react';
import { Attachment } from '../../types';

export const ChatInterface: React.FC = () => {
  const {
    messages,
    sendMessage,
    pendingAttachments,
    addAttachment,
    removeAttachment,
    isGeneratingResponse
  } = usePlatformStore();

  const [inputContent, setInputContent] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newAttachment: Attachment = {
        id: `pdf-${Date.now()}-${i}`,
        type: 'pdf',
        name: file.name,
        url: '#',
        size: `${Math.round(file.size / 1024)} KB`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addAttachment(newAttachment);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    let cleanUrl = linkInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const domain = cleanUrl.replace(/https?:\/\//i, '').split('/')[0];

    const linkAttachment: Attachment = {
      id: `link-${Date.now()}`,
      type: 'link',
      name: domain ? `${domain}${cleanUrl.includes('?') ? '...' : ''}` : cleanUrl,
      url: cleanUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addAttachment(linkAttachment);
    setLinkInput('');
    setShowLinkInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && pendingAttachments.length === 0) return;

    sendMessage(inputContent);
    setInputContent('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputContent(prompt);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-mono font-bold">
            Student Review Room
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Document & Requisition Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload candidate resumes (PDF) and enter job descriptions to inspect semantic fit.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 font-mono bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MSOT Parser v2.4</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((message) => {
          const isStudent = message.sender === 'student';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'} space-y-2`}
            >
              {/* Sender & Timestamp */}
              <div className="flex items-center gap-2 text-xs font-mono px-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  {isStudent ? (
                    <>
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Candidate
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-slate-600" /> MSOT Advisor
                    </>
                  )}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-400">{message.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-5 leading-relaxed text-sm sm:text-base shadow-xs ${
                  isStudent
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                }`}
              >
                {/* Attached files preview inside message */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className={`mb-4 pb-3 border-b space-y-2 ${isStudent ? 'border-slate-700' : 'border-slate-100'}`}>
                    <span className={`text-xs font-mono uppercase tracking-wider block font-semibold ${isStudent ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ingested Evaluation Assets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                            att.type === 'pdf'
                              ? isStudent
                                ? 'bg-slate-800 border-slate-700 text-slate-200'
                                : 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                              : isStudent
                              ? 'bg-slate-800 border-slate-700 text-slate-200'
                              : 'bg-sky-50 border-sky-200 text-sky-900 font-medium'
                          }`}
                        >
                          {att.type === 'pdf' ? (
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isStudent ? 'text-rose-400' : 'text-rose-600'}`} />
                          ) : (
                            <Link2 className={`w-3.5 h-3.5 shrink-0 ${isStudent ? 'text-sky-400' : 'text-sky-600'}`} />
                          )}
                          <span className="truncate max-w-[220px]">{att.name}</span>
                          {att.size && (
                            <span className="opacity-70">({att.size})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content text */}
                <div className="whitespace-pre-line font-normal text-sm sm:text-base leading-relaxed">
                  {message.content}
                </div>

                {/* Structured Action Items */}
                {message.actionItems && message.actionItems.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm text-indigo-950">
                    <span className="font-mono text-xs uppercase tracking-wider text-indigo-800 block mb-2 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Recommended Action Items:
                    </span>
                    <ul className="space-y-1.5">
                      {message.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-800 font-medium">
                          <span className="text-indigo-600 font-bold mt-0.5">↳</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGeneratingResponse && (
          <div className="flex flex-col items-start space-y-2">
            <span className="text-xs text-indigo-600 font-mono px-1 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              MSOT Analysis System · Processing
            </span>
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs sm:text-sm text-slate-700 flex items-center gap-3 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>Benchmarking resume keywords against role criteria...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Starters */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm border-t border-slate-200">
        <span className="text-xs text-slate-500 font-mono uppercase shrink-0 font-bold">Prompts:</span>
        <button
          onClick={() => handleQuickPrompt('Evaluate ATS keyword density against Cloud Platform L4 requirements')}
          className="whitespace-nowrap px-3 py-1.5 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg bg-white text-slate-700 font-medium transition-all shadow-2xs"
        >
          ATS Keyword Density Check
        </button>
        <button
          onClick={() => handleQuickPrompt('Critique bullet points in my Experience section for quantified impact')}
          className="whitespace-nowrap px-3 py-1.5 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg bg-white text-slate-700 font-medium transition-all shadow-2xs"
        >
          Quantified Metrics Audit
        </button>
        <button
          onClick={() => handleQuickPrompt('Cross-reference my Go Raft project with senior infrastructure criteria')}
          className="whitespace-nowrap px-3 py-1.5 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg bg-white text-slate-700 font-medium transition-all shadow-2xs"
        >
          Distributed Systems Depth
        </button>
      </div>

      {/* Attachment Staging Area */}
      {pendingAttachments.length > 0 && (
        <div className="mb-2.5 p-2.5 bg-slate-100 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs sm:text-sm shadow-2xs">
          <span className="text-xs font-mono uppercase text-slate-600 font-bold">Ready to Send:</span>
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border bg-white ${
                att.type === 'pdf'
                  ? 'border-rose-200 bg-rose-50/40 text-rose-950 font-medium'
                  : 'border-sky-200 bg-sky-50/40 text-sky-950 font-medium'
              }`}
            >
              {att.type === 'pdf' ? (
                <FileText className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <Link2 className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span className="font-mono text-xs max-w-[200px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link Input Overlay */}
      {showLinkInput && (
        <form onSubmit={handleAddLink} className="mb-2.5 p-2.5 bg-white border border-slate-300 rounded-xl flex gap-2 shadow-md">
          <input
            type="text"
            placeholder="Paste job posting URL, GitHub repo, or portfolio link..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="flex-1 text-xs sm:text-sm px-3 py-1.5 outline-hidden font-mono border border-slate-200 rounded-lg focus:border-indigo-600"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold"
          >
            Add Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-3 py-1.5 text-slate-500 text-xs sm:text-sm hover:text-slate-800 font-medium"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Main Composer Box */}
      <form onSubmit={handleSubmit} className="border border-slate-200 rounded-2xl p-3.5 bg-white focus-within:border-indigo-600 transition-all shadow-xs">
        <textarea
          rows={2}
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Ask a question, request a resume critique, or prompt a job comparison..."
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-hidden resize-none leading-relaxed font-normal"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
              multiple
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Attach PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all font-medium"
            >
              <Link2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Enter Link</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={(!inputContent.trim() && pendingAttachments.length === 0) || isGeneratingResponse}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <span>Send Message</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
