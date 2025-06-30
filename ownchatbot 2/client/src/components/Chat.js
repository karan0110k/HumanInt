import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chat.css';
import { signOut } from '../firebase'; // Import the signOut function

const Chat = ({ user }) => {
  // Use the logged-in user's display name, with a fallback
  const userName = user?.displayName || "User";
  // NOTE: userAvatar constant is no longer needed and has been removed.

  const [chatSessions, setChatSessions] = useState([
    { id: '1', title: 'Current Conversation', messages: [] },
    // { id: '2', title: 'React Learning', messages: [] },
    // { id: '3', title: 'Project Ideas', messages: [] },
  ]);
  const [activeSession, setActiveSession] = useState('1');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestions = [
    'What can you do?',
    'How are you?',
    'Tell me a joke',
    'Who built you?',
    'Summarize a news article',
    'How to learn React?'
  ];

  const currentMessages = chatSessions.find(session => session.id === activeSession)?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, loading, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input, selectedFiles]);

  const handleSuggestionClick = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession = { id: newId, title: 'New Conversation', messages: [] };
    setChatSessions([newSession, ...chatSessions]);
    setActiveSession(newId);
    setInput('');
    setSelectedFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    e.target.value = null;
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };
  
  const handleSignOut = () => {
    signOut().catch((error) => console.error("Sign out error", error));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || loading) return;

    const userMessageContent = input.trim();
    const currentUserFiles = [...selectedFiles];
    const userFilesInfo = currentUserFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    const userMessage = {
      role: 'user',
      content: userMessageContent,
      files: userFilesInfo
    };

    const updatedSessions = chatSessions.map(session => {
      if (session.id === activeSession) {
        const shouldUpdateTitle = session.messages.length === 0 && session.title === 'New Conversation';
        const newTitle = shouldUpdateTitle
          ? (userMessageContent || currentUserFiles[0]?.name || 'New Chat').slice(0, 30)
          : session.title;
        return { ...session, title: newTitle, messages: [...session.messages, userMessage] };
      }
      return session;
    });

    setChatSessions(updatedSessions);
    setInput('');
    setSelectedFiles([]);
    setLoading(true);

    try {
      const formData = new FormData();
      if (userMessageContent) formData.append('message', userMessageContent);
      currentUserFiles.forEach(file => formData.append('files', file));

      const apiResponse = await fetch('http://localhost:4003/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `Server error: ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      const botMessage = { role: 'assistant', content: (apiData.response || "").trim() };

      setChatSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSession
          ? { ...session, messages: [...session.messages, botMessage] }
          : session
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'error', content: `⚠️ Sorry, something went wrong. Please try again.` };
      setChatSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSession
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const showSendButton = input.trim() !== '' || selectedFiles.length > 0;

  return (
    <div className="chat-wrapper">
      {!isMobile && (
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Humint</h2>
            <button className="new-chat-btn" onClick={createNewChat}>
              <span>+</span> New chat
            </button>
          </div>
          <div className="chat-history">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`history-item ${activeSession === session.id ? 'active' : ''}`}
                onClick={() => setActiveSession(session.id)}
              >
                {session.title}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar">
                {/* FIX: Replaced all avatar logic with the emoji */}
                {'🙍🏻‍♂️'}
              </div>
              <span>{userName}</span>
              <button onClick={handleSignOut} className="signout-btn" title="Sign Out">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content">
        {currentMessages.length === 0 ? (
          <div className="welcome-screen">
            <div className="logo">
              <div className="logo-circle">H</div>
              <h1>Humint</h1>
            </div>
            <h2>How can I help you today?</h2>
            <div className="suggestions-grid">
              {suggestions.map((q, i) => (
                <div key={i} className="suggestion-card" onClick={() => handleSuggestionClick(q)}>
                  <h3>{q}</h3>
                  <div className="arrow-icon">→</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {currentMessages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div className="avatar">
                  {/* FIX: Replaced message avatar logic with the emoji */}
                  {m.role === 'user' ? '🙍🏻‍♂️' : '🤖'}
                </div>
                <div className="message-content">
                  {m.files && m.files.length > 0 && (
                    <div className="message-files">
                      {m.files.map((file, fileIdx) => (
                        <div key={fileIdx} className="message-file-item">
                          {file.type.startsWith('image/') && file.url ? (
                            <img src={file.url} alt={file.name} className="uploaded-image-preview" />
                          ) : (
                            <div className="file-icon">📁</div>
                          )}
                          <span className="file-name">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.content && <div className="text">{m.content}</div>}
                  {m.role === 'assistant' && (
                    <div className="message-actions">
                      <button className="action-btn" title="Like">👍</button>
                      <button className="action-btn" title="Dislike">👎</button>
                      <button className="action-btn" title="Regenerate response">↻</button>
                      <button className="action-btn" title="More options">⋮</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form className="chat-input-container" onSubmit={sendMessage}>
            {selectedFiles.length > 0 && (
                <div className="selected-files-preview-area">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="selected-file-item">
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} className="file-thumbnail" />
                            ) : (
                                <div className="file-thumbnail file-icon-placeholder">📄</div>
                            )}
                            <span className="file-name">{file.name}</span>
                            <button
                                type="button"
                                className="remove-file-btn"
                                onClick={() => removeSelectedFile(file.name)}
                                title={`Remove ${file.name}`}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
          <div className="input-wrapper">
            <div className="input-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
                accept="image/*, application/pdf, .doc, .docx, .txt, .csv, .xls, .xlsx"
              />
              {!showSendButton && (
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach files (images, documents)"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <textarea
              id="chat-input"
              ref={textareaRef}
              placeholder="Message Humint..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows="1"
            />
            {showSendButton && (
              <button type="submit" className="send-btn" disabled={loading}>
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="disclaimer">
            Humint may display inaccurate info, including about people, so double-check its responses.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
