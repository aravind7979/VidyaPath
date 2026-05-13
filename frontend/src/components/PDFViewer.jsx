import React from 'react';
import api from '../api';

function PDFViewer({ assets }) {
  const pdfAsset = assets.find(a => a.asset_type === 'pdf');

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-8">
      <div className="text-xl font-black text-[#F1F5F9] mb-6 flex items-center gap-3">
        <span className="text-3xl">📄</span> PDF Document
      </div>
      
      {!pdfAsset ? (
        <div className="border-2 border-dashed border-[#0EA5E9]/30 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">📄</div>
          <div className="text-[#94A3B8] font-bold mb-1">No Document Available</div>
          <div className="text-sm text-[#64748B]">A PDF file hasn't been uploaded for this chapter yet.</div>
        </div>
      ) : (
        <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-2xl p-6 flex items-center gap-5">
          <div className="text-4xl">📄</div>
          <div className="flex-1">
            <div className="font-bold text-[#E2E8F0] mb-1">Chapter Document</div>
            <div className="text-xs text-[#64748B]">Ready to read or download</div>
          </div>
          <a 
            href={`${api.defaults.baseURL}/static/${pdfAsset.file_path}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-2.5 px-6 rounded-xl transition-all"
          >
            Open PDF
          </a>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
