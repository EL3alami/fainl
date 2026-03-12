import { useState, useRef, useEffect } from "react";
import "./ChatbotWidget.css";

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "أهلاً بك! أنا المساعد الذكي لكلية الحاسبات والمعلومات. كيف يمكنني مساعدتك اليوم بخصوص لائحة الكلية وأمورها؟", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { text: userMsg, sender: "user" }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/chatbot/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await response.json();
            setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { text: "عذراً، حدث خطأ أثناء الاتصال. حاول مرة أخرى.", sender: "bot" }
            ]);
        }

        setIsLoading(false);
    };

    return (
        <div className={`chatbot-container ${isOpen ? "open" : "closed"}`}>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>المساعد الذكي 🎓</h3>
                        <button className="close-btn" onClick={toggleChat}>&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble bot loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="اكتب سؤالك هنا..."
                            disabled={isLoading}
                            dir="rtl"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            إرسال
                        </button>
                    </form>
                </div>
            )}
            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={toggleChat}>
                    💬 تحدث معي
                </button>
            )}
        </div>
    );
}
