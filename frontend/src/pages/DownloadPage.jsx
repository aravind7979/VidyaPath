import React from 'react';
import { Download, Monitor, CheckCircle, Apple, MonitorDot } from 'lucide-react';

function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] font-nunito text-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8B5CF6]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl text-center z-10">
        <div className="text-4xl md:text-6xl font-black text-[#F1F5F9] mb-4 tracking-tight">
          Take <span className="text-[#0EA5E9]">VidyaPath</span> Anywhere
        </div>
        <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Download our native desktop application for an optimized, distraction-free learning experience. Syncs seamlessly with your online account.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Windows Download */}
          <div className="bg-[#1E293B] border border-white/10 hover:border-[#0EA5E9]/50 transition-all p-8 rounded-3xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Monitor className="w-16 h-16 text-[#0EA5E9] mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-2">Windows</h3>
            <p className="text-[#64748B] mb-8 font-medium">Windows 10 / 11 (64-bit)</p>
            <a 
              href="https://github.com/your-username/your-repo/releases/latest/download/VidyaPath_Installer.exe"
              className="flex items-center justify-center gap-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_4px_20px_rgba(14,165,233,0.3)] transform hover:-translate-y-1 w-full"
            >
              <Download size={20} /> Download for Windows
            </a>
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><CheckCircle size={16} className="text-[#34D399]" /> Faster performance</div>
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><CheckCircle size={16} className="text-[#34D399]" /> Offline notes access</div>
            </div>
          </div>

          {/* Linux Download */}
          <div className="bg-[#1E293B] border border-white/10 hover:border-[#8B5CF6]/50 transition-all p-8 rounded-3xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MonitorDot className="w-16 h-16 text-[#8B5CF6] mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-2">Linux</h3>
            <p className="text-[#64748B] mb-8 font-medium">AppImage / Debian</p>
            <a 
              href="https://github.com/your-username/your-repo/releases/latest/download/VidyaPath_AppImage.AppImage"
              className="flex items-center justify-center gap-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] transform hover:-translate-y-1 w-full"
            >
              <Download size={20} /> Download for Linux
            </a>
            <div className="mt-5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><CheckCircle size={16} className="text-[#34D399]" /> Native integration</div>
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><CheckCircle size={16} className="text-[#34D399]" /> Low resource usage</div>
            </div>
          </div>

        </div>

        <div className="mt-16 text-[#64748B] text-sm">
          <a href="/" className="hover:text-[#0EA5E9] hover:underline transition-colors font-bold">← Back to Login</a>
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;
