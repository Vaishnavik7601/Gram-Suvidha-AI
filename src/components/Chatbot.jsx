import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chatbot = ({ inline = false }) => {
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState([
    { text: "Welcome to Gram Suvidha AI Assistant.\nAre you already registered with Gram Suvidha? (Type 'Yes' or 'No')", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatStep, setChatStep] = useState('registration'); // registration -> menu -> query/status
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleLogic = async (userInput) => {
    const text = userInput.trim().toLowerCase();
    
    if (chatStep === 'registration') {
      if (text === 'no') {
        setChatStep('reg_flow');
        return {
          text: "You can create a new account by clicking the button below. Once registered, return here and type 'menu' to continue.",
          link: { url: "/signup", label: "Register Now" }
        };
      } else if (text === 'yes') {
        setChatStep('menu');
        return "Great! Please choose an option from the Main Menu:\n1. Raise Complaint\n2. Ask Query\n3. Check Status";
      }
      return "Please answer with 'Yes' or 'No'.";
    }

    if (chatStep === 'reg_flow') {
      if (text === 'menu') {
        setChatStep('menu');
        return "Main Menu:\n1. Raise Complaint\n2. Ask Query\n3. Check Status";
      }
      return {
        text: "Please navigate to the registration page using the button below. Type 'menu' to go to the main menu.",
        link: { url: "/signup", label: "Register Now" }
      };
    }

    if (chatStep === 'menu') {
      if (text === '1' || text.includes('complaint')) {
        return "To raise a complaint, please use the 'Register Complaint' button on your dashboard. Type 'menu' to see options again.";
      } else if (text === '2' || text.includes('query')) {
        setChatStep('query');
        return "You have selected 'Ask Query'.\n\nHere are some examples of what you can ask:\n- What is the eligibility for PM Awas Yojana?\n- How do I apply for a water connection?\n- Tell me about MGNREGA benefits.\n\nPlease type your question below, and I will assist you.";
      } else if (text === '3' || text.includes('status')) {
        setChatStep('status');
        return "Please enter your Complaint ID (e.g. COMP-1234) to check its status.";
      }
      return "Invalid option. Please choose:\n1. Raise Complaint\n2. Ask Query\n3. Check Status";
    }

    if (chatStep === 'status') {
      if (text === 'menu') {
        setChatStep('menu');
        return "Main Menu:\n1. Raise Complaint\n2. Ask Query\n3. Check Status";
      }
      return `Checking status for ${userInput.toUpperCase()}...\nStatus: IN PROGRESS. (This is a system generated response). Type 'menu' to go back.`;
    }

    if (chatStep === 'query') {
      if (text === 'menu') {
        setChatStep('menu');
        return "Main Menu:\n1. Raise Complaint\n2. Ask Query\n3. Check Status";
      }
      
      // Call actual backend for query
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:8000/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userInput })
        });
        const data = await res.json();
        setIsLoading(false);
        return data.response + "\n\n(Type 'menu' to return to Main Menu)";
      } catch (err) {
        setIsLoading(false);
        return "Sorry, I am having trouble connecting to the AI server right now. Type 'menu' to go back.";
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Check if we need to show loading
    if (chatStep === 'query' && input.trim().toLowerCase() !== 'menu') {
      setIsLoading(true);
    }

    const botResponse = await handleLogic(input);
    
    if (typeof botResponse === 'string') {
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    } else {
      setMessages(prev => [...prev, { text: botResponse.text, isBot: true, link: botResponse.link }]);
    }
  };

  const containerClasses = inline 
    ? "w-full h-full bg-white flex flex-col overflow-hidden"
    : `fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 transition-all origin-bottom-right border border-slate-200 overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`;

  return (
    <>
      {/* Floating Action Button */}
      {!inline && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-gov-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      <div className={containerClasses}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gov-blue to-blue-800 p-4 text-white flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <span className="font-bold block leading-tight">Gram Suvidha AI</span>
              <span className="text-xs text-blue-200 block">Always online</span>
            </div>
          </div>
          {!inline && (
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
          <div className="text-center text-xs text-slate-400 mb-4 mt-2">Today</div>
          {messages.map((msg, idx) => (
            <div key={idx} className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-line leading-relaxed ${msg.isBot ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-sm' : 'bg-gov-blue text-white self-end rounded-tr-sm'}`}>
              {msg.text}
              {msg.link && (
                <div className="mt-3 mb-1">
                  <button 
                    onClick={() => navigate(msg.link.url)}
                    className="inline-block bg-gov-saffron text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-600 transition-colors w-full sm:w-auto text-center"
                  >
                    {msg.link.label}
                  </button>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="bg-white border border-slate-200 text-slate-500 self-start rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gov-blue/50 transition-all border border-transparent focus:border-gov-blue"
          />
          <button type="submit" className="w-12 h-12 bg-gov-blue text-white rounded-full flex items-center justify-center hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-md disabled:shadow-none" disabled={!input.trim()}>
            <Send size={18} className="-ml-1" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
