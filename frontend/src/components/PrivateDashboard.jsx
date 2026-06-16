/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  LogOut, 
  BookOpen, 
  Trash2, 
  Pencil,
  X,
  ExternalLink,
  Loader2, 
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PrivateDashboard({ userEmail, onLogout }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  
  const [semanticResults, setSemanticResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [viewingBookmark, setViewingBookmark] = useState(null);

  const [processingBookmarkIds, setProcessingBookmarkIds] = useState(new Set());

  useEffect(() => {
    const authTok = localStorage.getItem('auth_token');
    fetch('/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${authTok}` }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        onLogout();
        throw new Error("Session expired or invalid");
      }
      if (!res.ok) {
        throw new Error("Failed to load bookmarks");
      }
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }
      const mapped = data.map((b) => ({
        id: b.id,
        title: b.title,
        url: b.url,
        summary: b.notes || b.summary || '',
        tags: b.tags || [],
        createdAt: b.createdAt || new Date().toISOString()
      }));
      setBookmarks(mapped);
    })
    .catch(err => {
      console.error("Error loading bookmarks:", err);
    })
    .finally(() => setIsLoadingBookmarks(false));
  }, [onLogout]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!value.trim()) {
      setSemanticResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const authTok = localStorage.getItem('auth_token');
        const res = await fetch(`/api/bookmarks/search?q=${encodeURIComponent(value.trim())}`, {
          headers: { 'Authorization': `Bearer ${authTok}` }
        });
        if (res.status === 401 || res.status === 403) {
          onLogout();
          return;
        }
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((b) => ({
          id: b.id,
          title: b.title,
          url: b.url,
          summary: b.notes || b.summary || '',
          tags: b.tags || [],
          createdAt: b.createdAt || new Date().toISOString()
        }));
        setSemanticResults(mapped);
      } catch (err) {
        console.error('Semantic search error:', err);
        setSemanticResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 18;
    const rotateY = (centerX - x) / 18;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  const displayedBookmarks = semanticResults !== null ? semanticResults : bookmarks;

  const handleAddBookmark = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const authTok = localStorage.getItem('auth_token');
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authTok}` },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl || '',
          notes: '', 
          tags: []
        })
      });
      const data = await res.json();
      
      const savedId = data.id;
      const newBookmark = {
        id: savedId,
        title: data.title || newTitle,
        url: data.url || newUrl,
        summary: '',
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString()
      };

      setBookmarks(prev => [newBookmark, ...prev]);
      setProcessingBookmarkIds(prev => new Set(prev).add(savedId));
      const savedTitle = newTitle;
      const savedUrl = newUrl;

      setNewTitle('');
      setNewUrl('');
      setIsModalOpen(false);
      setIsSaving(false);

      const pollForAiData = async (retries) => {
        for (let attempt = 0; attempt < retries; attempt++) {
          await new Promise(r => setTimeout(r, 2000));
          try {
            const freshRes = await fetch(`/api/bookmarks/${savedId}`, {
              headers: { 'Authorization': `Bearer ${authTok}` }
            });
            if (!freshRes.ok) continue;
            const fresh = await freshRes.json();
            const aiSummary = fresh.notes || fresh.summary || '';
            const hasAiData = aiSummary.length > 0 ||
              (fresh.tags && fresh.tags.length > 0) ||
              (fresh.title && savedUrl && fresh.title !== savedUrl && fresh.title !== savedTitle);
            if (hasAiData) {
              setBookmarks(prev => prev.map(b => b.id === savedId ? {
                ...b,
                title: fresh.title || b.title,
                summary: aiSummary,
                tags: fresh.tags || b.tags,
              } : b));
              return;
            }
          } catch {
          }
        }
      };

      try {
        await pollForAiData(15);
      } finally {
        setProcessingBookmarkIds(prev => {
          const next = new Set(prev);
          next.delete(savedId);
          return next;
        });
      }
    } catch(err) {
      console.error(err);
      setIsSaving(false);
      alert('Failed to save bookmark.');
    }
  };

  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setEditTitle(bookmark.title);
    setEditUrl(bookmark.url);
    setEditNotes(bookmark.summary);
  };

  const handleUpdateBookmark = async (e) => {
    e.preventDefault();
    if (!editingBookmark || !editTitle.trim()) return;

    try {
      const authTok = localStorage.getItem('auth_token');
      const res = await fetch(`/api/bookmarks/${editingBookmark.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authTok}` },
        body: JSON.stringify({
          title: editTitle,
          url: editUrl,
          notes: editNotes,
          tags: editingBookmark.tags
        })
      });
      const data = await res.json();
      
      setBookmarks(prev => prev.map(b => b.id === editingBookmark.id ? {
        ...b,
        title: data.title || editTitle,
        url: data.url || editUrl,
        summary: data.notes || editNotes,
        tags: data.tags || b.tags,
      } : b));

      setEditingBookmark(null);
    } catch(err) {
      console.error(err);
      alert('Failed to update bookmark.');
    }
  };

  const handleDeleteBookmark = async (id, name) => {
    if (confirm(`Are you sure you want to remove "${name}"?`)) {
      try {
        const authTok = localStorage.getItem('auth_token');
        await fetch(`/api/bookmarks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authTok}` }
        });
        setBookmarks(prev => prev.filter(b => b.id !== id));
        if (viewingBookmark?.id === id) setViewingBookmark(null);
      } catch(err) {
        console.error(err);
        alert('Failed to delete bookmark.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col relative selection:bg-primary/20 selection:text-primary-fixed">
      {/* Header */}
      <header className="w-full h-20 top-0 sticky z-40 bg-[#131313]/85 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">WebStash Library</span>
          </div>

          {/* Inline desktop search box */}
          <div className="hidden md:flex items-center bg-[#1c1b1b] border border-outline-variant/40 rounded-lg px-4 py-2 w-96 focus-within:border-primary transition-all duration-300">
            <Search className="w-4 h-4 text-primary mr-3 shrink-0" />
            <input 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-[#e5e2e1] placeholder-on-surface-variant/40 w-full"
              placeholder="Search your bookmarks using semantic AI search..."
              type="text"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 ml-2" />}
          </div>

          <div className="flex items-center gap-6">
            <button 
              id="new-bookmark-header-btn"
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-on-primary hover:bg-primary-fixed px-5 py-2 rounded font-sans font-semibold text-xs tracking-wider transition-all duration-300 active:scale-95 cursor-pointer inner-glow flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Bookmark</span>
            </button>

            <button 
              onClick={onLogout}
              className="text-[#d1c5b4]/70 hover:text-primary tracking-widest text-xs font-semibold cursor-pointer uppercase transition-colors flex items-center gap-1.5"
              title="Close secure session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 md:px-16 py-8 flex flex-col">
        
        {/* Archive Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4 mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-serif text-sm font-semibold tracking-widest text-primary uppercase">My Smart Bookmark Archive</span>
          </div>

          <span className="hidden sm:inline text-[10px] font-mono text-[#d1c5b4]/40 uppercase tracking-[0.1em]">
            Identity: {userEmail}
          </span>
        </div>

        {/* COLLECTION SECTION */}
        <div className="space-y-8 animate-fade-in-up">
          {/* Search filter for mobile view */}
          <div className="flex md:hidden items-center bg-[#1c1b1b] border border-outline-variant/40 rounded-lg px-4 py-2 w-full focus-within:border-primary transition-all duration-300">
            <Search className="w-4 h-4 text-primary mr-3 shrink-0" />
            <input 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs text-[#e5e2e1] placeholder-on-surface-variant/40 w-full"
              placeholder="Semantic AI search..."
              type="text"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 ml-2" />}
          </div>

            {/* Bookmark Grid */}
            {displayedBookmarks.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-outline-variant/20 rounded-xl space-y-4">
                <HelpCircle className="w-12 h-12 text-primary/45 mx-auto animate-pulse" />
                <p className="font-serif italic text-[#d1c5b4]/60">
                  {isLoadingBookmarks ? 'Loading your archive...' : searchQuery ? 'No matching bookmarks found.' : 'Your private index is empty.'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary uppercase text-xs tracking-widest px-4 py-2 rounded cursor-pointer"
                  >
                    Create New Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {displayedBookmarks.map((bookmark) => (
                    <motion.div
                      key={bookmark.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      onClick={() => setViewingBookmark(bookmark)}
                      className="glass-card rounded-xl overflow-hidden flex flex-col justify-between group h-full relative cursor-pointer"
                      style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' 
                      }}
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-end items-start gap-1.5 mb-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(bookmark); }}
                            className="opacity-0 group-hover:opacity-100 text-[#d1c5b4]/50 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-all cursor-pointer"
                            title="Edit bookmark"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteBookmark(bookmark.id, bookmark.title); }}
                            className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 p-1.5 rounded hover:bg-red-950/20 transition-all cursor-pointer"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="font-serif text-xl md:text-2xl text-[#e5e2e1] group-hover:text-primary transition-colors leading-tight font-semibold">
                          {bookmark.title}
                        </h3>

                        {bookmark.summary ? (
                          <p className="text-on-surface-variant font-sans text-sm line-clamp-3 leading-relaxed italic opacity-85">
                            {bookmark.summary}
                          </p>
                        ) : processingBookmarkIds.has(bookmark.id) ? (
                          <div className="flex items-center gap-2 text-primary/60 text-xs font-mono uppercase tracking-wider">
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                            <span>Synthesizing abstract...</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-6 pt-0 space-y-4 border-t border-outline-variant/10 mt-auto">
                        {bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-4">
                            {bookmark.tags.map((tag, i) => (
                              <span 
                                key={i} 
                                className="text-[9px] font-mono border border-outline-variant/40 px-2.5 py-0.5 rounded uppercase tracking-wider text-on-surface-variant/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-[#d1c5b4]/40 font-mono">
                          <span>{new Date(bookmark.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <a 
                            href={bookmark.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:text-primary-fixed underline transition-colors"
                          >
                            Visit Source
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      {/* DETAIL VIEW MODAL — Full summary on card click */}
      <AnimatePresence>
        {viewingBookmark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingBookmark(null)}
              className="absolute inset-0 bg-[#0e0e0e]/85 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-[#1c1b1b] border border-primary-container/20 rounded-xl z-10 shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-outline-variant/20">
                <h2 className="font-serif text-2xl font-semibold text-[#e5e2e1] leading-tight pr-4">
                  {viewingBookmark.title}
                </h2>
                <button 
                  onClick={() => setViewingBookmark(null)}
                  className="text-[#d1c5b4]/50 hover:text-[#e5e2e1] p-1.5 rounded hover:bg-[#e5e2e1]/10 transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Summary</span>
                  {viewingBookmark.summary ? (
                    <p className="text-[#d1c5b4] font-sans text-sm leading-relaxed whitespace-pre-wrap">
                      {viewingBookmark.summary}
                    </p>
                  ) : processingBookmarkIds.has(viewingBookmark.id) ? (
                    <div className="flex items-center gap-2 text-primary/70 text-xs font-mono uppercase tracking-wider animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Extracting semantic metadata...</span>
                    </div>
                  ) : (
                    <p className="text-[#d1c5b4/50] font-sans text-sm italic">
                      No summary available.
                    </p>
                  )}
                </div>

                {/* Tags */}
                {viewingBookmark.tags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {viewingBookmark.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="text-[10px] font-mono border border-outline-variant/40 px-3 py-1 rounded uppercase tracking-wider text-on-surface-variant/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Details</span>
                  <div className="bg-[#131313]/60 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-[#d1c5b4]/50 font-mono text-xs shrink-0 mt-0.5">URL</span>
                      <a 
                        href={viewingBookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-fixed underline transition-colors break-all text-xs"
                      >
                        {viewingBookmark.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#d1c5b4]/50 font-mono text-xs shrink-0">Date</span>
                      <span className="text-[#d1c5b4]/80 text-xs">
                        {new Date(viewingBookmark.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between p-6 pt-4 border-t border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setViewingBookmark(null); openEditModal(viewingBookmark); }}
                    className="text-[#d1c5b4]/70 hover:text-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteBookmark(viewingBookmark.id, viewingBookmark.title)}
                    className="text-red-400/50 hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
                <a 
                  href={viewingBookmark.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary hover:bg-primary-fixed px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Source</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW BOOKMARK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0e0e0e]/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl bg-[#1c1b1b] border border-primary-container/20 p-8 rounded-xl z-10 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <span className="font-serif text-xl font-semibold text-[#e5e2e1]">Create Smart Bookmark</span>
                <span className="text-[10px] font-mono text-primary uppercase tracking-[0.15em]">Private Ledger</span>
              </div>

              <form onSubmit={handleAddBookmark} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#d1c5b4]/50 uppercase tracking-widest">Bookmark Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Epistemology of Private Collections (optional — AI will auto-generate)"
                  className="w-full bg-[#131313] border border-outline-variant/40 rounded py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary placeholder-on-surface-variant/20"
                />
                </div>

                {/* URL */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#d1c5b4]/50 uppercase tracking-widest">Source URL</label>
                  <input 
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-[#131313] border border-outline-variant/40 rounded py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary placeholder-on-surface-variant/20"
                  />
                </div>

                {/* Info about auto-summary */}
                <div className="bg-[#1a0f00]/40 border border-primary/15 rounded px-4 py-3 flex items-center gap-2 text-[11px] text-[#d1c5b4]/60 font-sans">
                  <Loader2 className="w-3.5 h-3.5 text-primary/50 shrink-0" />
                  <span>An AI summary will be automatically generated after saving.</span>
                </div>

                {/* Submits */}
                <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/20">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-outline-variant/50 text-[#d1c5b4]/80 hover:text-white px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-transparent transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary text-on-primary hover:bg-primary-fixed px-6 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Bookmark'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT BOOKMARK MODAL */}
      <AnimatePresence>
        {editingBookmark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBookmark(null)}
              className="absolute inset-0 bg-[#0e0e0e]/85 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl bg-[#1c1b1b] border border-primary-container/20 p-8 rounded-xl z-10 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <span className="font-serif text-xl font-semibold text-[#e5e2e1]">Edit Bookmark</span>
                <button 
                  onClick={() => setEditingBookmark(null)}
                  className="text-[#d1c5b4]/50 hover:text-[#e5e2e1] p-1 rounded hover:bg-[#e5e2e1]/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateBookmark} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#d1c5b4]/50 uppercase tracking-widest">Title *</label>
                  <input 
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#131313] border border-outline-variant/40 rounded py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#d1c5b4]/50 uppercase tracking-widest">Source URL</label>
                  <input 
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full bg-[#131313] border border-outline-variant/40 rounded py-2.5 px-3.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Notes / Summary */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-[#d1c5b4]/50 uppercase tracking-widest">Notes / Summary</label>
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-[#131313] border border-outline-variant/40 rounded py-2 px-3.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-primary h-32 resize-none"
                  />
                </div>

                {/* Submits */}
                <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/20">
                  <button 
                    type="button"
                    onClick={() => setEditingBookmark(null)}
                    className="border border-outline-variant/50 text-[#d1c5b4]/80 hover:text-white px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-transparent transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit"
                    className="bg-primary text-on-primary hover:bg-primary-fixed px-6 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
