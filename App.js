import { useState, useRef, useEffect, useCallback } from "react";

// ── Unique user/app ID ──────────────────────────────────────────────────
const ME = { id: "me", name: "You", handle: "you", avatar: "🎬" };

// ── Dummy seed posts (no real video, just placeholders) ──────────────────
const SEED_POSTS = [
  {
    id: "s1", userId: "alice", name: "Alice Moon", handle: "alicemoon", avatar: "🌙",
    caption: "Golden hour magic ✨", likes: 284, comments: [
      { id: "c1", handle: "bob_ray", text: "Stunning!! 😍" },
      { id: "c2", handle: "jay_k", text: "Fire clip 🔥" },
    ], liked: false, blobUrl: null, color: "linear-gradient(135deg,#f093fb,#f5576c)",
  },
  {
    id: "s2", userId: "bob", name: "Bob Ray", handle: "bob_ray", avatar: "🌊",
    caption: "Ocean vibes 🌊 #surf", likes: 512, comments: [
      { id: "c3", handle: "alicemoon", text: "Take me there 🏄" },
    ], liked: false, blobUrl: null, color: "linear-gradient(135deg,#4facfe,#00f2fe)",
  },
  {
    id: "s3", userId: "jay", name: "Jay K", handle: "jay_k", avatar: "🌿",
    caption: "Early morning run 🌅", likes: 97, comments: [], liked: false,
    blobUrl: null, color: "linear-gradient(135deg,#43e97b,#38f9d7)",
  },
];

// ── Icons ────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 24, fill = "none", stroke = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const HeartIcon = ({ filled }) => filled
  ? <svg width={22} height={22} viewBox="0 0 24 24" fill="#ff3b5c" stroke="#ff3b5c" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
  : <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;

// ── Gradient Avatar ──────────────────────────────────────────────────────
const Avatar = ({ emoji, size = 40, ring = false }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "linear-gradient(135deg,#f093fb,#f5576c,#4facfe)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.45, flexShrink: 0,
    boxShadow: ring ? "0 0 0 2px #0d0d0d, 0 0 0 4px #f5576c" : "none",
  }}>{emoji}</div>
);

// ── Story bubble ─────────────────────────────────────────────────────────
const StoryBubble = ({ user, isMe, onClick }) => (
  <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", minWidth: 64 }}>
    <div style={{ position: "relative" }}>
      <Avatar emoji={user.avatar} size={56} ring={!isMe} />
      {isMe && (
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 20, height: 20, borderRadius: "50%",
          background: "#3d9aff", border: "2px solid #0d0d0d",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff"
        }}>+</div>
      )}
    </div>
    <span style={{ fontSize: 11, color: "#aaa", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {isMe ? "Your story" : user.handle}
    </span>
  </div>
);

// ── Video / Gradient Post Card ────────────────────────────────────────────
const PostCard = ({ post, onLike, onComment }) => {
  const videoRef = useRef(null);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!post.blobUrl || !videoRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { videoRef.current?.play(); setPlaying(true); }
      else { videoRef.current?.pause(); setPlaying(false); }
    }, { threshold: 0.6 });
    obs.observe(videoRef.current);
    return () => obs.disconnect();
  }, [post.blobUrl]);

  const handleSubmitComment = () => {
    if (!commentInput.trim()) return;
    onComment(post.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div style={{
      background: "#141414", borderRadius: 20, overflow: "hidden",
      border: "1px solid #222", marginBottom: 24,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <Avatar emoji={post.avatar} size={42} ring />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{post.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>@{post.handle} · 5s clip</div>
        </div>
        <div style={{ color: "#555", fontSize: 20 }}>···</div>
      </div>

      {/* Video or gradient placeholder */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", maxHeight: 480, overflow: "hidden", background: "#000" }}>
        {post.blobUrl ? (
          <>
            <video
              ref={videoRef} src={post.blobUrl} loop muted={muted}
              playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button onClick={() => setMuted(m => !m)} style={{
              position: "absolute", bottom: 12, right: 12,
              background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%",
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", cursor: "pointer", fontSize: 16
            }}>{muted ? "🔇" : "🔊"}</button>
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(0,0,0,0.55)", borderRadius: 20, padding: "3px 10px",
              fontSize: 11, color: "#fff", fontWeight: 600, letterSpacing: 0.5
            }}>5s</div>
          </>
        ) : (
          <div style={{ width: "100%", height: "100%", background: post.color, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 48 }}>▶</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>5-second clip</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
          <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <HeartIcon filled={post.liked} />
          </button>
          <button onClick={() => setShowComments(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ccc" }}>
            <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ccc" }}>
            <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </button>
          <div style={{ flex: 1 }} />
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ccc" }}>
            <Icon d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </button>
        </div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
          {(post.likes).toLocaleString()} likes
        </div>
        <div style={{ fontSize: 13, color: "#ddd", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: "#fff", marginRight: 6 }}>{post.handle}</span>
          {post.caption}
        </div>
        {post.comments.length > 0 && (
          <button onClick={() => setShowComments(s => !s)} style={{ background: "none", border: "none", color: "#666", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 6 }}>
            View all {post.comments.length} comment{post.comments.length > 1 ? "s" : ""}
          </button>
        )}
        {showComments && (
          <div style={{ marginBottom: 8 }}>
            {post.comments.map(c => (
              <div key={c.id} style={{ fontSize: 13, color: "#ddd", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#fff", marginRight: 6 }}>@{c.handle}</span>{c.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment input */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 16px 14px", borderTop: "1px solid #1e1e1e", marginTop: 4 }}>
        <Avatar emoji={ME.avatar} size={30} />
        <input
          value={commentInput} onChange={e => setCommentInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmitComment()}
          placeholder="Add a comment…"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#ccc", fontSize: 13, fontFamily: "inherit"
          }}
        />
        {commentInput.trim() && (
          <button onClick={handleSubmitComment} style={{
            background: "none", border: "none", color: "#3d9aff",
            fontWeight: 700, fontSize: 13, cursor: "pointer"
          }}>Post</button>
        )}
      </div>
    </div>
  );
};

// ── Camera / Recorder Modal ───────────────────────────────────────────────
const RecorderModal = ({ onClose, onSave }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let s;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
      .then(stream => {
        s = stream; setStream(stream); setCameraReady(true);
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      })
      .catch(() => setError("Camera access denied. Please allow camera permissions."));
    return () => { s?.getTracks().forEach(t => t.stop()); clearInterval(timerRef.current); };
  }, []);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
    mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setPreview(URL.createObjectURL(blob));
      setStream(null);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
    setCountdown(5);
    let c = 5;
    timerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(timerRef.current); mr.stop(); setRecording(false); }
    }, 1000);
  };

  const handleSave = () => {
    if (!preview) return;
    onSave({ blobUrl: preview, caption });
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)"
    }}>
      <div style={{
        background: "#111", borderRadius: 24, width: "100%", maxWidth: 420,
        border: "1px solid #222", overflow: "hidden", margin: "0 16px"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1e1e1e" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 22 }}>✕</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>New Flick</span>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ padding: 20 }}>
          {error ? (
            <div style={{ textAlign: "center", padding: "24px 8px" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
              <div style={{ color: "#ff3b5c", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Camera Unavailable</div>
              <div style={{ color: "#777", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                Camera is blocked inside this preview.<br/>
                <span style={{ color: "#555" }}>Deploy the app to a real URL for full camera access.</span>
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "20px 16px", border: "1px solid #2a2a2a", marginBottom: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Upload from Gallery</div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 16 }}>Pick any video from your phone — works right now!</div>
                <label style={{
                  display: "block", padding: "13px 24px",
                  background: "linear-gradient(135deg,#f093fb,#f5576c)", borderRadius: 50,
                  color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
                  boxShadow: "0 4px 20px rgba(245,87,108,0.4)"
                }}>
                  Choose Video
                  <input type="file" accept="video/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ color: "#444", fontSize: 11 }}>💡 Deploy to Vercel/Netlify for live camera recording</div>
            </div>
          ) : preview ? (
            <div>
              <video src={preview} controls loop autoPlay muted style={{ width: "100%", borderRadius: 16, aspectRatio: "9/16", objectFit: "cover", background: "#000", maxHeight: 340 }} />
              <input
                value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Write a caption…"
                style={{
                  width: "100%", marginTop: 16, background: "#1a1a1a",
                  border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 16px",
                  color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={() => setPreview(null)} style={{
                  flex: 1, padding: "12px", borderRadius: 50, border: "1px solid #333",
                  background: "transparent", color: "#aaa", cursor: "pointer", fontWeight: 600, fontSize: 14
                }}>Retake</button>
                <button onClick={handleSave} style={{
                  flex: 2, padding: "12px", borderRadius: 50, border: "none",
                  background: "linear-gradient(135deg,#f093fb,#f5576c)", color: "#fff",
                  cursor: "pointer", fontWeight: 700, fontSize: 14
                }}>Share Flick ✨</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", maxHeight: 340, borderRadius: 16, overflow: "hidden", background: "#000" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {recording && (
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.3)"
                  }}>
                    <div style={{
                      width: 90, height: 90, borderRadius: "50%",
                      border: "4px solid #ff3b5c", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 40, fontWeight: 900, color: "#fff",
                      boxShadow: "0 0 30px rgba(255,59,92,0.6)"
                    }}>{countdown}</div>
                  </div>
                )}
                {!cameraReady && !error && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 12 }}>Starting camera…</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", justifyContent: "center" }}>
                <label style={{
                  padding: "10px 18px", borderRadius: 50, border: "1px solid #333",
                  background: "transparent", color: "#aaa", cursor: "pointer", fontWeight: 600, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6
                }}>
                  📂 Upload
                  <input type="file" accept="video/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
                <button
                  onClick={startRecording} disabled={recording || !cameraReady}
                  style={{
                    width: 72, height: 72, borderRadius: "50%", border: "4px solid #fff",
                    background: recording ? "#ff3b5c" : "linear-gradient(135deg,#f093fb,#f5576c)",
                    cursor: recording ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, boxShadow: "0 4px 20px rgba(245,87,108,0.5)",
                    transition: "transform 0.1s", transform: recording ? "scale(0.92)" : "scale(1)"
                  }}
                >
                  {recording ? "⏺" : "⏺"}
                </button>
                <div style={{ width: 80 }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 8, color: "#555", fontSize: 12 }}>
                {recording ? `Recording… ${countdown}s remaining` : "Tap ⏺ to record 5 seconds"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Profile Screen ────────────────────────────────────────────────────────
const ProfileScreen = ({ posts }) => {
  const myPosts = posts.filter(p => p.userId === "me");
  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ padding: "30px 20px 20px", textAlign: "center" }}>
        <Avatar emoji={ME.avatar} size={90} ring />
        <div style={{ marginTop: 16, fontWeight: 800, fontSize: 20, color: "#fff" }}>{ME.name}</div>
        <div style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>@{ME.handle}</div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
          {[["Flicks", myPosts.length], ["Followers", 0], ["Following", 0]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
        {myPosts.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#444" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 14 }}>No flicks yet. Record your first one!</div>
          </div>
        ) : myPosts.map(p => (
          <div key={p.id} style={{ aspectRatio: "1", background: p.blobUrl ? "#000" : p.color, position: "relative", overflow: "hidden" }}>
            {p.blobUrl
              ? <video src={p.blobUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>▶</div>
            }
            <div style={{ position: "absolute", bottom: 4, right: 6, fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>5s</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────
export default function FlickApp() {
  const [posts, setPosts] = useState(SEED_POSTS);
  const [tab, setTab] = useState("home");
  const [showRecorder, setShowRecorder] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleLike = useCallback((id) => {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p));
  }, []);

  const handleComment = useCallback((id, text) => {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, comments: [...p.comments, { id: Date.now().toString(), handle: ME.handle, text }] }
      : p));
  }, []);

  const handleSave = useCallback(({ blobUrl, caption }) => {
    const colors = [
      "linear-gradient(135deg,#fa709a,#fee140)",
      "linear-gradient(135deg,#a18cd1,#fbc2eb)",
      "linear-gradient(135deg,#ffecd2,#fcb69f)",
      "linear-gradient(135deg,#667eea,#764ba2)",
    ];
    const newPost = {
      id: `p${Date.now()}`, userId: "me", name: ME.name, handle: ME.handle, avatar: ME.avatar,
      caption: caption || "My new flick 🎬", likes: 0, comments: [], liked: false,
      blobUrl, color: colors[Math.floor(Math.random() * colors.length)],
    };
    setPosts(prev => [newPost, ...prev]);
    setTab("home");
    showToast("✨ Flick shared!");
  }, []);

  const STORIES = [
    { id: "alice", handle: "alicemoon", avatar: "🌙" },
    { id: "bob", handle: "bob_ray", avatar: "🌊" },
    { id: "jay", handle: "jay_k", avatar: "🌿" },
  ];

  return (
    <div style={{
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0d0d0d", minHeight: "100vh", color: "#fff",
      maxWidth: 480, margin: "0 auto", position: "relative"
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "linear-gradient(180deg,#0d0d0d 80%, transparent)",
        padding: "16px 20px 8px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{
          fontSize: 26, fontWeight: 900, letterSpacing: -1,
          background: "linear-gradient(90deg,#f093fb,#f5576c,#fc5c7d)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Flick</div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 50, padding: "4px 12px", fontSize: 11, color: "#666", fontWeight: 600 }}>5s only</div>
          <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 22, padding: "0 4px" }}>🔔</button>
        </div>
      </div>

      {/* Content */}
      {tab === "home" && (
        <div style={{ paddingBottom: 80 }}>
          {/* Stories */}
          <div style={{ overflowX: "auto", display: "flex", gap: 16, padding: "8px 20px 16px", scrollbarWidth: "none" }}>
            <StoryBubble user={ME} isMe onClick={() => setShowRecorder(true)} />
            {STORIES.map(s => <StoryBubble key={s.id} user={s} onClick={() => {}} />)}
          </div>
          {/* Feed */}
          <div style={{ padding: "0 16px" }}>
            {posts.map(p => (
              <PostCard key={p.id} post={p} onLike={handleLike} onComment={handleComment} />
            ))}
          </div>
        </div>
      )}
      {tab === "profile" && <ProfileScreen posts={posts} />}
      {tab === "explore" && (
        <div style={{ padding: "20px 16px 80px" }}>
          <div style={{ color: "#666", textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <div style={{ marginTop: 12 }}>Explore coming soon</div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "linear-gradient(0deg,#0d0d0d 85%,transparent)",
        padding: "8px 0 16px",
        display: "flex", alignItems: "center", justifyContent: "space-around"
      }}>
        {[
          { key: "home", label: "Home", icon: "🏠" },
          { key: "explore", label: "Explore", icon: "🔍" },
          { key: "record", label: "Record", icon: null },
          { key: "activity", label: "Activity", icon: "❤️" },
          { key: "profile", label: "Profile", icon: "👤" },
        ].map(item => {
          if (item.key === "record") return (
            <button key="record" onClick={() => setShowRecorder(true)} style={{
              width: 52, height: 52, borderRadius: "50%", border: "none",
              background: "linear-gradient(135deg,#f093fb,#f5576c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, cursor: "pointer", boxShadow: "0 4px 20px rgba(245,87,108,0.6)",
              transform: "translateY(-6px)"
            }}>+</button>
          );
          if (item.key === "activity") return (
            <button key="activity" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 8, opacity: 0.5 }}>❤️</button>
          );
          return (
            <button key={item.key} onClick={() => setTab(item.key)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 22, padding: 8,
              opacity: tab === item.key ? 1 : 0.45,
              filter: tab === item.key ? "none" : "grayscale(0.5)"
            }}>{item.icon}</button>
          );
        })}
      </div>

      {/* Recorder modal */}
      {showRecorder && <RecorderModal onClose={() => setShowRecorder(false)} onSave={handleSave} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
          color: "#fff", padding: "10px 24px", borderRadius: 50,
          fontSize: 14, fontWeight: 600, zIndex: 2000,
          border: "1px solid rgba(255,255,255,0.15)",
          animation: "fadeIn 0.2s ease"
        }}>{toast}</div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}
