'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  membership_number: string
  author_name: string
  author_school: string
  title: string
  description: string
  images: string[]
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
}

interface Comment {
  id: string
  post_id: string
  parent_id: string | null
  membership_number: string
  author_name: string
  author_school: string
  content: string
  created_at: string
}

interface Member {
  membership_number: string
  name: string
  school: string
}

export default function IdeaNetPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [member, setMember] = useState<Member | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})

  // Auth state
  const [digits, setDigits] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Post form state
  const [postTitle, setPostTitle] = useState('')
  const [postDesc, setPostDesc] = useState('')
  const [postImages, setPostImages] = useState<string[]>([])
  const [uploadingImg, setUploadingImg] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('ideanet_member')
    if (saved) setMember(JSON.parse(saved))
    loadPosts()
  }, [sort])

  const loadPosts = async () => {
    setLoading(true)
    const res = await fetch(`/api/ideanet/posts?sort=${sort}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  const handleVerify = async () => {
    if (digits.length !== 5) { setAuthError('Enter exactly 5 digits'); return }
    setAuthLoading(true)
    setAuthError('')
    const res = await fetch('/api/ideanet/verify-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digits })
    })
    const data = await res.json()
    if (data.valid) {
      setMember(data)
      localStorage.setItem('ideanet_member', JSON.stringify(data))
      setShowAuthModal(false)
      setDigits('')
    } else {
      setAuthError(data.error || 'Not found')
    }
    setAuthLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (postImages.length + files.length > 3) { alert('Maximum 3 images'); return }
    setUploadingImg(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/ideanet/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setPostImages(prev => [...prev, data.url])
    }
    setUploadingImg(false)
  }

  // Regex to detect emojis, em-dash (—), en-dash (–)
  const hasBlockedChars = (text: string) => {
    const regex = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}\u2014\u2013]/gu
    return regex.test(text)
  }

  const cleanBlockedChars = (text: string) => {
    const regex = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}\u2014\u2013]/gu
    return text.replace(regex, '')
  }

  const handleTitleChange = (val: string) => {
    if (hasBlockedChars(val)) {
      setFormError('Emojis and dashes (—, –) are not allowed by AISCA rules')
      setPostTitle(cleanBlockedChars(val))
    } else {
      setFormError('')
      setPostTitle(val)
    }
  }

  const handleDescChange = (val: string) => {
    if (hasBlockedChars(val)) {
      setFormError('Emojis and dashes (—, –) are not allowed by AISCA rules')
      setPostDesc(cleanBlockedChars(val))
    } else {
      setFormError('')
      setPostDesc(val)
    }
  }

  const handleSubmitPost = async () => {
    if (!member) return
    if (!postTitle.trim() || !postDesc.trim()) { alert('Title and description required'); return }
    if (hasBlockedChars(postTitle) || hasBlockedChars(postDesc)) {
      alert('Please remove emojis and dashes before submitting');
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/ideanet/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membership_number: member.membership_number,
        author_name: member.name,
        author_school: member.school,
        title: postTitle,
        description: postDesc,
        images: postImages
      })
    })
    const data = await res.json()
    if (data.success) {
      setShowPostModal(false)
      setPostTitle('')
      setPostDesc('')
      setPostImages([])
      setFormError('')
      loadPosts()
    } else {
      alert(data.error || 'Failed to submit post')
    }
    setSubmitting(false)
  }

  const handleVote = async (post_id: string, vote_type: 'up' | 'down') => {
    if (!member) { setShowAuthModal(true); return }
    const res = await fetch('/api/ideanet/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id, membership_number: member.membership_number, vote_type })
    })
    const data = await res.json()
    if (data.success) {
      setPosts(prev => prev.map(p => p.id === post_id
        ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes }
        : p
      ))
      // Also update selected post if open
      setSelectedPost(prev => prev && prev.id === post_id ? { ...prev, upvotes: data.upvotes, downvotes: data.downvotes } : prev)
      setUserVotes(prev => {
        const current = prev[post_id]
        if (current === vote_type) {
          const next = { ...prev }
          delete next[post_id]
          return next
        }
        return { ...prev, [post_id]: vote_type }
      })
    }
  }

  const openPost = async (post: Post) => {
    setSelectedPost(post)
    const res = await fetch(`/api/ideanet/comments?post_id=${post.id}`)
    const data = await res.json()
    setComments(data.comments || [])
  }

  const handleComment = async (parent_id?: string) => {
    if (!member) { setShowAuthModal(true); return }
    const content = parent_id ? replyText : commentText
    if (!content.trim()) return
    const res = await fetch('/api/ideanet/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: selectedPost?.id,
        parent_id: parent_id || null,
        membership_number: member.membership_number,
        author_name: member.name,
        author_school: member.school,
        content
      })
    })
    const data = await res.json()
    if (data.success) {
      setComments(prev => [...prev, data.comment])
      if (parent_id) { setReplyText(''); setReplyTo(null) }
      else setCommentText('')
      setPosts(prev => prev.map(p => p.id === selectedPost?.id
        ? { ...p, comment_count: p.comment_count + 1 }
        : p
      ))
      setSelectedPost(prev => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev)
    }
  }

  const handleDeleteComment = async (comment_id: string) => {
    if (!member) return
    if (!confirm('Delete this comment?')) return
    await fetch('/api/ideanet/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id, membership_number: member.membership_number })
    })
    setComments(prev => prev.filter(c => c.id !== comment_id))
  }

  const handleDeletePost = async (post_id: string) => {
    if (!member) return
    if (!confirm('Delete this idea permanently?')) return
    await fetch('/api/ideanet/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id, membership_number: member.membership_number })
    })
    setPosts(prev => prev.filter(p => p.id !== post_id))
    setSelectedPost(null)
  }

  const topComments = comments.filter(c => !c.parent_id)
  const getReplies = (id: string) => comments.filter(c => c.parent_id === id)

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const netScore = (p: Post) => p.upvotes - p.downvotes

  return (
    <div style={{ minHeight: '100vh', background: '#080808', paddingTop: '80px', fontFamily: 'inherit' }}>

      {/* ───── Header ───── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '32px 0 0', marginBottom: '32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 24px' }}>
          
          {/* Return to Home link */}
          <div style={{ marginBottom: '20px' }}>
            <Link 
              href="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ffffff'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255, 255, 255, 0.45)'}
            >
              ← Return to Website Home
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(255,220,100,0.15) 0%, rgba(255,160,50,0.1) 100%)',
                  border: '1px solid rgba(255,200,80,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                }}>💡</div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}>
                  IdeaNet
                </h1>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0, letterSpacing: '0.01em' }}>
                Sri Lanka's student commerce project idea network
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {member ? (
                <>
                  <div style={{
                    padding: '6px 14px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                    fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: '500'
                  }}>
                    {member.name.split(' ')[0]}
                  </div>
                  <button
                    onClick={() => setShowPostModal(true)}
                    style={{
                      padding: '8px 20px', background: '#ffffff', color: '#000000',
                      border: 'none', borderRadius: '8px', fontWeight: '700',
                      fontSize: '13px', cursor: 'pointer', letterSpacing: '-0.01em',
                      transition: 'opacity 0.15s ease'
                    }}
                  >+ Post Idea</button>
                  <button
                    onClick={() => { setMember(null); localStorage.removeItem('ideanet_member') }}
                    style={{
                      padding: '8px 14px', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', color: 'rgba(255,255,255,0.3)',
                      fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >Sign Out</button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    padding: '9px 22px', background: '#ffffff', color: '#000000',
                    border: 'none', borderRadius: '8px', fontWeight: '700',
                    fontSize: '13px', cursor: 'pointer', letterSpacing: '-0.01em',
                    transition: 'opacity 0.15s ease'
                  }}
                >Join with AISCA ID</button>
              )}
            </div>
          </div>

          {/* Sort tabs */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
            {[
              { key: 'top', label: '▲ Most Voted' },
              { key: 'new', label: '✦ Newest' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSort(tab.key as 'top' | 'new')}
                style={{
                  padding: '7px 16px',
                  background: sort === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: sort === tab.key ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: sort === tab.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', fontSize: '12px', fontWeight: sort === tab.key ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Posts feed ───── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '0.1em' }}>
            LOADING IDEAS...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <p style={{ fontSize: '48px', marginBottom: '20px' }}>💡</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', fontWeight: '600', marginBottom: '8px' }}>No ideas yet</p>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Be the first to share a project idea</p>
          </div>
        ) : posts.map(post => (
          <div
            key={post.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              marginBottom: '10px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
          >
            <div style={{ display: 'flex' }}>
              {/* Vote sidebar */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '16px 10px', gap: '2px',
                background: 'rgba(0,0,0,0.15)',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                minWidth: '46px'
              }}>
                <button
                  onClick={() => handleVote(post.id, 'up')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '14px', padding: '4px 6px',
                    color: userVotes[post.id] === 'up' ? '#f5c842' : 'rgba(255,255,255,0.25)',
                    transition: 'color 0.15s ease, transform 0.15s ease',
                    lineHeight: 1
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                >▲</button>
                <span style={{
                  fontSize: '13px', fontWeight: '700', lineHeight: 1, padding: '2px 0',
                  color: netScore(post) > 0 ? '#f5c842' : netScore(post) < 0 ? 'rgba(255,90,90,0.9)' : 'rgba(255,255,255,0.35)'
                }}>
                  {netScore(post)}
                </span>
                <button
                  onClick={() => handleVote(post.id, 'down')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '14px', padding: '4px 6px',
                    color: userVotes[post.id] === 'down' ? 'rgba(255,90,90,0.9)' : 'rgba(255,255,255,0.25)',
                    transition: 'color 0.15s ease, transform 0.15s ease',
                    lineHeight: 1
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                >▼</button>
              </div>

              {/* Post content */}
              <div style={{ flex: 1, padding: '14px 18px' }}>
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)',
                    flexShrink: 0
                  }}>
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
                    {post.author_name}
                  </span>
                  {post.author_school && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                      · {post.author_school}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}>
                    {timeAgo(post.created_at)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => openPost(post)}
                  style={{
                    fontSize: '15px', fontWeight: '700', color: 'rgba(255,255,255,0.92)',
                    margin: '0 0 6px', cursor: 'pointer', lineHeight: '1.35',
                    transition: 'color 0.15s ease', fontFamily: "'Space Grotesk', sans-serif"
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.92)'}
                >
                  {post.title}
                </h3>

                {/* Description preview */}
                <p style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.45)',
                  margin: '0 0 10px', lineHeight: '1.6',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {post.description}
                </p>

                {/* Images preview */}
                {post.images?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {post.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <button
                    onClick={() => openPost(post)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: 'rgba(255,255,255,0.28)',
                      padding: '4px 0', display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'}
                  >
                    💬 {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                  </button>
                  {member && member.membership_number === post.membership_number && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '12px', color: 'rgba(255,80,80,0.35)', padding: '4px 0',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.7)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.35)'}
                    >Delete</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ───── Auth Modal ───── */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px', padding: '36px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>💡</div>
              <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 10px', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>Join IdeaNet</h3>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                Enter your AISCA membership number to post and vote on ideas
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Membership Number
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${authError ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease'
              }}>
                <span style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.25)', fontSize: '13px', borderRight: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap', fontWeight: '500', flexShrink: 0 }}>
                  AISCA-2026-
                </span>
                <input
                  value={digits}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                    setDigits(val)
                    setAuthError('')
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="XXXXX"
                  maxLength={5}
                  autoFocus
                  style={{
                    flex: 1, padding: '14px 12px', background: 'transparent',
                    border: 'none', color: '#fff', fontSize: '16px',
                    fontWeight: '700', letterSpacing: '0.15em', outline: 'none'
                  }}
                />
              </div>
              {authError && (
                <p style={{ color: 'rgba(255,90,90,0.9)', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ⚠ {authError}
                </p>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={authLoading || digits.length !== 5}
              style={{
                width: '100%', padding: '14px',
                background: digits.length === 5 ? '#ffffff' : 'rgba(255,255,255,0.06)',
                color: digits.length === 5 ? '#000000' : 'rgba(255,255,255,0.25)',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                fontSize: '14px', cursor: digits.length === 5 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {authLoading ? 'Verifying...' : 'Continue →'}
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '11px', marginTop: '18px', lineHeight: '1.6' }}>
              Only approved AISCA associates can post and vote
            </p>
          </div>
        </div>
      )}

      {/* ───── Post Idea Modal ───── */}
      {showPostModal && member && (
        <div
          onClick={() => setShowPostModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '620px',
              background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px', overflow: 'hidden', margin: 'auto',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
            }}
          >
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Share a Project Idea</h3>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Author identity card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>{member.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{member.membership_number}</p>
                </div>
              </div>

              {formError && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255,90,90,0.08)',
                  border: '1px solid rgba(255,90,90,0.25)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'rgba(255,100,100,0.95)',
                  marginBottom: '18px',
                  lineHeight: '1.5'
                }}>
                  ⚠ {formError}
                </div>
              )}

              {/* Title */}
              <input
                value={postTitle}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Project idea title..."
                maxLength={120}
                style={{
                  width: '100%', padding: '13px 16px', marginBottom: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease',
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
              />

              {/* Description */}
              <textarea
                value={postDesc}
                onChange={e => handleDescChange(e.target.value)}
                placeholder="Describe your project idea... What problem does it solve? How would it work? Who would benefit?"
                rows={5}
                style={{
                  width: '100%', padding: '13px 16px', marginBottom: '16px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '10px', color: '#fff', fontSize: '14px', lineHeight: '1.65',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
              />

              {/* Image upload */}
              <div style={{ marginBottom: '24px' }}>
                {postImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {postImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: '90px', height: '68px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button
                          onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ position: 'absolute', top: '-7px', right: '-7px', width: '20px', height: '20px', borderRadius: '50%', background: '#ff4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontWeight: '700' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {postImages.length < 3 && (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s ease' }}>
                    {uploadingImg ? '⏳ Uploading...' : `📎 Add Image (${postImages.length}/3)`}
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImg} />
                  </label>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitPost}
                disabled={submitting || !postTitle.trim() || !postDesc.trim()}
                style={{
                  width: '100%', padding: '14px',
                  background: postTitle.trim() && postDesc.trim() ? '#ffffff' : 'rgba(255,255,255,0.06)',
                  color: postTitle.trim() && postDesc.trim() ? '#000000' : 'rgba(255,255,255,0.25)',
                  border: 'none', borderRadius: '10px', fontWeight: '700',
                  fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {submitting ? 'Posting...' : 'Post Idea →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Post Detail / Comments Modal ───── */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 2000, overflowY: 'auto', padding: '20px', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '780px', margin: '0 auto', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
          >
            {/* Detail header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>
                  {selectedPost.author_name.charAt(0)}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>{selectedPost.author_name}</span>
                {selectedPost.author_school && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>· {selectedPost.author_school}</span>}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>· {timeAgo(selectedPost.created_at)}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Post body */}
            <div style={{ padding: '28px 28px 20px' }}>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 14px', lineHeight: '1.3', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
                {selectedPost.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.85', margin: '0 0 20px' }}>
                {selectedPost.description}
              </p>

              {selectedPost.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {selectedPost.images.map((img, i) => (
                    <img key={i} src={img} alt="" style={{ maxWidth: '260px', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
              )}

              {/* Vote row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => handleVote(selectedPost.id, 'up')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: userVotes[selectedPost.id] === 'up' ? '#f5c842' : 'rgba(255,255,255,0.3)', transition: 'all 0.15s ease' }}
                >▲</button>
                <span style={{ fontSize: '15px', fontWeight: '700', color: netScore(selectedPost) > 0 ? '#f5c842' : netScore(selectedPost) < 0 ? 'rgba(255,90,90,0.9)' : '#fff' }}>
                  {netScore(selectedPost)}
                </span>
                <button
                  onClick={() => handleVote(selectedPost.id, 'down')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: userVotes[selectedPost.id] === 'down' ? 'rgba(255,90,90,0.9)' : 'rgba(255,255,255,0.3)', transition: 'all 0.15s ease' }}
                >▼</button>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginLeft: '4px' }}>
                  {selectedPost.upvotes} up · {selectedPost.downvotes} down
                </span>
                {member && member.membership_number === selectedPost.membership_number && (
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,80,80,0.5)', padding: '5px 12px', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,80,80,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.9)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.5)' }}
                  >Delete Post</button>
                )}
              </div>
            </div>

            {/* ── Comments section ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.15em', margin: 0, textTransform: 'uppercase' }}>
                  Comments
                </h4>
                <span style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', padding: '2px 8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                  {comments.length}
                </span>
              </div>

              {/* Comment input */}
              {member ? (
                <div style={{ marginBottom: '24px' }}>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this idea..."
                    rows={3}
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: '10px', color: '#fff', fontSize: '13px', lineHeight: '1.65',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                      marginBottom: '10px', transition: 'border-color 0.2s ease'
                    }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
                  />
                  <button
                    onClick={() => handleComment()}
                    disabled={!commentText.trim()}
                    style={{
                      padding: '9px 22px',
                      background: commentText.trim() ? '#fff' : 'rgba(255,255,255,0.05)',
                      color: commentText.trim() ? '#000' : 'rgba(255,255,255,0.25)',
                      border: 'none', borderRadius: '8px', fontWeight: '600',
                      fontSize: '13px', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >Comment</button>
                </div>
              ) : (
                <div style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '24px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '0 0 12px' }}>Sign in with your AISCA ID to comment</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    style={{ padding: '9px 22px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                  >Join IdeaNet</button>
                </div>
              )}

              {/* Comments list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topComments.length === 0 && (
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                    No comments yet. Start the conversation.
                  </p>
                )}
                {topComments.map(comment => {
                  const replies = getReplies(comment.id)
                  return (
                    <div key={comment.id}>
                      {/* Top-level comment */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', flexShrink: 0 }}>
                          {comment.author_name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>{comment.author_name}</span>
                            {comment.author_school && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>· {comment.author_school}</span>}
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>{timeAgo(comment.created_at)}</span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: '1.65', margin: '0 0 8px' }}>
                            {comment.content}
                          </p>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {member && (
                              <button
                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: replyTo === comment.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', padding: 0, transition: 'color 0.15s ease' }}
                              >{replyTo === comment.id ? '↩ Cancel' : '↩ Reply'}</button>
                            )}
                            {member && member.membership_number === comment.membership_number && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,80,80,0.35)', padding: 0, transition: 'color 0.15s ease' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.7)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.35)'}
                              >Delete</button>
                            )}
                          </div>

                          {/* Reply input */}
                          {replyTo === comment.id && (
                            <div style={{ marginTop: '12px' }}>
                              <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.author_name}...`}
                                rows={2}
                                autoFocus
                                style={{
                                  width: '100%', padding: '10px 14px',
                                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                                  borderRadius: '8px', color: '#fff', fontSize: '13px',
                                  outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                                  marginBottom: '8px', transition: 'border-color 0.2s ease'
                                }}
                                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'}
                                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
                              />
                              <button
                                onClick={() => handleComment(comment.id)}
                                disabled={!replyText.trim()}
                                style={{
                                  padding: '7px 16px',
                                  background: replyText.trim() ? '#fff' : 'rgba(255,255,255,0.05)',
                                  color: replyText.trim() ? '#000' : 'rgba(255,255,255,0.25)',
                                  border: 'none', borderRadius: '6px', fontWeight: '600',
                                  fontSize: '12px', cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                  transition: 'all 0.2s ease'
                                }}
                              >Post Reply</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Replies */}
                      {replies.length > 0 && (
                        <div style={{ marginTop: '12px', marginLeft: '38px', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {replies.map(reply => (
                            <div key={reply.id} style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', flexShrink: 0 }}>
                                {reply.author_name.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.55)' }}>{reply.author_name}</span>
                                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>{timeAgo(reply.created_at)}</span>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.65', margin: '0 0 6px' }}>{reply.content}</p>
                                {member && member.membership_number === reply.membership_number && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,80,80,0.3)', padding: 0, transition: 'color 0.15s ease' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.7)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,80,80,0.3)'}
                                  >Delete</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
