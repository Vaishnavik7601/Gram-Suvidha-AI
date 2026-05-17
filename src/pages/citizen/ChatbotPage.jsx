import Chatbot from '../../components/Chatbot';

const ChatbotPage = () => {
  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-8">
      {/* Full width Chatbot Container */}
      <div className="w-full max-w-4xl h-[75vh] md:h-[80vh] min-h-[600px] shadow-lg rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <Chatbot inline={true} />
      </div>
    </div>
  );
};

export default ChatbotPage;
