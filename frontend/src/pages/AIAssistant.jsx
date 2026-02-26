import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import './AIAssistant.css';

export default function AIAssistant() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { role: 'assistant', text: language === 'hi' ? 'नमस्ते! मैं KrishiMitra AI हूं। खेती के बारे में कुछ भी पूछें!' : language === 'kn' ? 'ನಮಸ್ಕಾರ! ನಾನು KrishiMitra AI. ಕೃಷಿ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!' : 'Hello! I\'m KrishiMitra AI. Ask me anything about farming!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const examples = [
        '🌾 Best crop for black soil in Kharif?',
        '💧 How much water does wheat need?',
        '🦠 How to treat tomato blight?',
        '💰 Current onion price in Karnataka?'
    ];

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;
        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        try {
            const history = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
            const res = await aiAPI.chat({
                message: text,
                language,
                userProfile: user,
                conversationHistory: history
            });
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: '❌ Unable to reach AI. Please check your API key in the backend .env file.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    const startVoice = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return alert('Voice not supported in this browser.');
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
        rec.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
        rec.onend = () => setIsListening(false);
        rec.start();
        recognitionRef.current = rec;
        setIsListening(true);
    };

    return (
        <div className="ai-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>🤖 {t('ai.title')}</h1>
                    <p>Powered by Google Gemini AI</p>
                </div>
            </header>

            {messages.length === 1 && (
                <div className="ai-examples">
                    <p className="section-title">Try asking:</p>
                    {examples.map((ex, i) => (
                        <button key={i} className="example-chip" onClick={() => sendMessage(ex)}>{ex}</button>
                    ))}
                </div>
            )}

            <div className="ai-messages">
                {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role}`}>
                        {m.role === 'assistant' && <div className="msg-avatar">🌱</div>}
                        <div className="msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="msg-avatar">🌱</div>
                        <div className="msg-bubble typing"><span /><span /><span /></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-input-bar">
                <button className={`voice-btn ${isListening ? 'listening' : ''}`} onClick={startVoice}>🎤</button>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder={isListening ? t('ai.listening') : t('ai.placeholder')}
                    className="ai-input"
                />
                <button className="send-btn" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>➤</button>
            </div>
        </div>
    );
}
