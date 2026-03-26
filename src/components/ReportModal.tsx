'use client';

/**
 * SENTINEL — Modal de Rapport IA (1:1 sentinel.html)
 * Design tactique avec classification de sécurité et structure modulaire.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ReportResponse } from '@/lib/types';

interface ReportModalProps {
  report: ReportResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ report, isOpen, onClose }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop fixed inset-0 bg-[#060810ec] z-[500] flex items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="modal bg-[var(--bg2)] border border-[var(--line2)] w-[750px] max-w-[95vw] max-h-[85vh] flex flex-col rounded-[2px] shadow-2xl animate-slide-up transform transition-transform duration-200">
        
        {/* Modal Header */}
        <div className="modal-header p-[14px_20px] border-b border-[var(--line2)] flex items-center justify-between shrink-0">
          <div className="modal-title font-[var(--cond)] text-[14px] font-semibold tracking-[0.12em] uppercase text-[var(--green)]">
            Rapport d'analyse tactique — IA SENTINEL
          </div>
          <button 
            onClick={onClose}
            className="modal-close font-mono-tech text-[12px] text-[var(--text3)] bg-none border-none cursor-pointer p-[4px_8px] hover:text-[var(--text)] transition-colors"
          >
            [ FERMER ]
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body flex-1 overflow-y-auto p-[24px] custom-scrollbar">
          
          <div className="report-meta flex gap-[20px] mb-[16px] pb-[12px] border-b border-[var(--line)]">
            <div className="report-meta-item font-mono-tech text-[10px] text-[var(--text3)] uppercase">ID: <span className="text-[var(--text2)]">REP-{Math.floor(Math.random()*9000+1000)}-X</span></div>
            <div className="report-meta-item font-mono-tech text-[10px] text-[var(--text3)] uppercase">Date: <span className="text-[var(--text2)]">{new Date().toLocaleDateString('fr-FR')}</span></div>
            <div className="report-meta-item font-mono-tech text-[10px] text-[var(--text3)] uppercase">Origine: <span className="text-[var(--text2)]">SENTINEL_ALPHA_9</span></div>
          </div>

          <div className="report-classification font-[var(--cond)] text-[13px] tracking-[0.2em] color-[var(--red)] font-bold text-center p-[6px] border border-[rgba(255,59,59,0.3)] mb-[16px] bg-[var(--red-bg)] text-[var(--red)]">
            TOP SECRET // ACCÈS RESTREINT SENTINEL CORE
          </div>

          <div className="report-content prose prose-invert max-w-none text-[13px] text-[var(--text2)] leading-[1.7]">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h3 className="report-section-title font-[var(--cond)] text-[12px] font-semibold tracking-[0.12em] uppercase text-[var(--green-dim)] mb-[8px] pb-[4px] border-b border-[var(--line)] mt-[20px]" {...props} />,
                h2: ({ node, ...props }) => <h4 className="font-mono-tech text-[11px] text-[var(--text)] uppercase mt-[16px] mb-[6px]" {...props} />,
                p: ({ node, ...props }) => <p className="mb-[12px]" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-[12px] space-y-1" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <div className="report-highlight bg-[rgba(255,149,0,0.08)] border-l-2 border-[var(--orange)] p-[8px_12px] my-[8px] font-mono-tech text-[12px] text-[var(--text)]" {...props} />
                ),
              }}
            >
              {report.summary}
            </ReactMarkdown>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="threat-badge inline-block p-[6px_20px] font-[var(--cond)] text-[14px] font-bold tracking-[0.15em] uppercase threat-high bg-[rgba(255,59,59,0.15)] text-[var(--red)] border border-[rgba(255,59,59,0.4)]">
              NIVEAU DE MENACE : ÉLEVÉ
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer p-[12px_20px] border-t border-[var(--line2)] flex gap-[10px] shrink-0">
          <button className="btn btn-primary bg-[var(--green)] text-[var(--bg0)] font-[var(--cond)] text-[13px] font-semibold tracking-[0.1em] uppercase px-[18px] py-[7px] rounded-[2px] transition-all hover:translate-y-[-1px]">📥 Télécharger PDF</button>
          <button onClick={onClose} className="btn btn-secondary bg-transparent text-[var(--text2)] border border-[var(--line2)] px-[18px] py-[7px] rounded-[2px] font-[var(--cond)] text-[13px] font-semibold tracking-[0.1em] uppercase hover:bg-[var(--bg3)] ml-auto">Fermer</button>
        </div>

      </div>
    </div>
  );
}
