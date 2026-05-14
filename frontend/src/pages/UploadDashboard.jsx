import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { UploadCloud, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';

function UploadDashboard() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');

  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    assetType: 'video',
    description: '',
    tags: ''
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/curriculum/classes').then(res => setClasses(res.data));
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      api.get(`/curriculum/classes/${selectedClassId}/subjects`).then(res => {
        setSubjects(res.data);
        setSelectedSubjectId('');
        setChapters([]);
      });
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSubjectId) {
      api.get(`/curriculum/subjects/${selectedSubjectId}/chapters`).then(res => {
        setChapters(res.data);
        setSelectedChapterId('');
      });
    }
  }, [selectedSubjectId]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setSuccess(false);
    
    // Auto detect type based on extension
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    let type = 'video';
    if (['pdf'].includes(ext)) type = 'pdf';
    if (['ppt', 'pptx'].includes(ext)) type = 'ppt';
    if (['doc', 'docx'].includes(ext)) type = 'doc';
    if (['png', 'jpg', 'jpeg'].includes(ext)) type = 'image';
    
    setMetadata(prev => ({ ...prev, assetType: type, title: selectedFile.name }));

    // AI Automation
    setAiGenerating(true);
    try {
      const res = await api.post('/content/ai-metadata', { filename: selectedFile.name });
      setMetadata(prev => ({
        ...prev,
        title: res.data.suggested_title || prev.title,
        description: res.data.description || '',
        tags: res.data.suggested_tags || ''
      }));
      // Optional: Auto select subject/chapter if it matches strings, but MVP skips this complex auto-select
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedChapterId || !file) {
      alert("Please select a chapter and a file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('chapter_id', selectedChapterId);
    formData.append('asset_type', metadata.assetType);
    formData.append('title', metadata.title);
    formData.append('description', metadata.description);
    formData.append('tags', metadata.tags);
    formData.append('file', file);

    try {
      await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setFile(null);
      setMetadata({ title: '', assetType: 'video', description: '', tags: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#F8FAFC] tracking-tight mb-2">Content Upload</h1>
        <p className="text-[#94A3B8]">AI-powered curriculum management dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Class Selection */}
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5">
          <label className="block text-sm font-bold text-[#CBD5E1] mb-2">1. Select Class</label>
          <select 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] transition-all"
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
        </div>

        {/* Subject Selection */}
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5">
          <label className="block text-sm font-bold text-[#CBD5E1] mb-2">2. Select Subject</label>
          <select 
            value={selectedSubjectId} 
            onChange={e => setSelectedSubjectId(e.target.value)}
            disabled={!selectedClassId}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] transition-all disabled:opacity-50"
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
          </select>
        </div>

        {/* Chapter Selection */}
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5">
          <label className="block text-sm font-bold text-[#CBD5E1] mb-2">3. Select Chapter</label>
          <select 
            value={selectedChapterId} 
            onChange={e => setSelectedChapterId(e.target.value)}
            disabled={!selectedSubjectId}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] transition-all disabled:opacity-50"
          >
            <option value="">-- Choose Chapter --</option>
            {chapters.map(ch => <option key={ch.id} value={ch.id}>Ch {ch.chapter_number}: {ch.chapter_name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-6">
        <label className="block text-sm font-bold text-[#CBD5E1] mb-4">4. Upload File</label>
        
        <div className="border-2 border-dashed border-[#334155] rounded-2xl p-8 text-center hover:border-[#8B5CF6] transition-colors relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={48} className="text-[#8B5CF6]" />
              <div className="text-[#F8FAFC] font-bold text-lg">{file.name}</div>
              <div className="text-[#94A3B8] text-sm">{(file.size / (1024*1024)).toFixed(2)} MB</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud size={48} className="text-[#64748B]" />
              <div className="text-[#F8FAFC] font-bold text-lg">Click to select a file</div>
              <div className="text-[#94A3B8] text-sm">Supports Video, PDF, PPT, Word, Image</div>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
              <Sparkles size={18} />
              <span>AI Metadata Generator</span>
              {aiGenerating && <Loader2 size={16} className="animate-spin ml-2" />}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  value={metadata.title} 
                  onChange={e => setMetadata({...metadata, title: e.target.value})}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Type</label>
                <select 
                  value={metadata.assetType} 
                  onChange={e => setMetadata({...metadata, assetType: e.target.value})}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none"
                >
                  <option value="video">Video MP4</option>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="doc">Word Document</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">Tags</label>
                <input 
                  type="text" 
                  value={metadata.tags} 
                  onChange={e => setMetadata({...metadata, tags: e.target.value})}
                  placeholder="e.g., Mathematics, Algebra, Equations"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#94A3B8] mb-1 uppercase tracking-wider">AI Generated Description</label>
                <textarea 
                  value={metadata.description} 
                  onChange={e => setMetadata({...metadata, description: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={uploading || aiGenerating}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
              {uploading ? "Publishing to Curriculum..." : "Publish Content"}
            </button>
            
            {success && (
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] p-4 rounded-xl flex items-center gap-3">
                <CheckCircle />
                <span className="font-bold">Successfully uploaded and published to the curriculum!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadDashboard;
