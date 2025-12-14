import React, { useState, useEffect, useRef } from 'react';
import { Group, Message, User } from '../types';
import { generateBotMessage } from '../services/geminiService';
import { Send, Users, MapPin, Beer, Snowflake, PartyPopper } from 'lucide-react';

interface GroupRoomProps {
  group: Group;
  currentUser: User;
}

const AVATARS = [
  'https://picsum.photos/id/1005/50/50',
  'https://picsum.photos/id/1011/50/50',
  'https://picsum.photos/id/1027/50/50',
  'https://picsum.photos/id/106/50/50',
  'https://picsum.photos/id/129/50/50',
  'https://picsum.photos/id/64/50/50',
  'https://picsum.photos/id/177/50/50',
];

// Korean names for bot simulation
const NAMES = ["민수", "서연", "준호", "지민", "현우", "수진", "도윤", "하은", "지훈", "예은"];

const GroupRoom: React.FC<GroupRoomProps> = ({ group, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      userId: 'system',
      text: `"${group.name}"에 오신 것을 환영합니다! 멤버를 기다리는 중...`,
      timestamp: new Date(),
      isSystem: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [memberCount, setMemberCount] = useState(group.currentMembers);
  const [isMeetupUnlocked, setIsMeetupUnlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate new members joining and random chatter
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const simulateActivity = async () => {
      // 1. Chance for a new member to join (if not full)
      if (memberCount < group.maxMembers && Math.random() > 0.6) {
        setMemberCount(prev => {
          const newCount = prev + 1;
          setMessages(prevMsgs => [
            ...prevMsgs,
            {
              id: `sys-${Date.now()}`,
              userId: 'system',
              text: `새로운 솔로가 입장했습니다! (${newCount}/${group.maxMembers})`,
              timestamp: new Date(),
              isSystem: true
            }
          ]);
          return newCount;
        });
      } 
      // 2. Chance for a chat message from a bot
      else if (memberCount > 1) {
        const randomUserIdx = Math.floor(Math.random() * Math.min(memberCount, NAMES.length));
        const botName = NAMES[randomUserIdx];
        
        // Convert messages to history format for AI context
        const history = messages
          .filter(m => !m.isSystem)
          .map(m => ({
            name: m.userId === currentUser.id ? currentUser.name : '누군가',
            text: m.text
          }));

        const botText = await generateBotMessage(group.name, history);
        
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            userId: `bot-${randomUserIdx}`,
            text: botText,
            timestamp: new Date(),
            isSystem: false
          }
        ]);
      }

      // Schedule next event (random 3s to 10s)
      const nextDelay = Math.random() * 7000 + 3000;
      timeoutId = setTimeout(simulateActivity, nextDelay);
    };

    timeoutId = setTimeout(simulateActivity, 2000);

    return () => clearTimeout(timeoutId);
  }, [memberCount, group.maxMembers, group.name, messages, currentUser.id, currentUser.name]);

  // Check for unlock condition
  useEffect(() => {
    if (memberCount >= group.maxMembers && !isMeetupUnlocked) {
      setIsMeetupUnlocked(true);
      setMessages(prev => [
        ...prev,
        {
          id: `sys-unlock-${Date.now()}`,
          userId: 'system',
          text: `🎉 정원 마감! 정모 장소가 공개되었습니다! 지도 핀을 확인하세요.`,
          timestamp: new Date(),
          isSystem: true
        }
      ]);
    }
  }, [memberCount, group.maxMembers, isMeetupUnlocked]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: `mine-${Date.now()}`,
      userId: currentUser.id,
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-900 border-x border-slate-700 relative overflow-hidden shadow-2xl">
      {/* Snowfall overlay within the container if desired, but we have global snow */}
      
      {/* Header */}
      <header className="bg-xmas-red p-4 shadow-lg z-10">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-white font-christmas text-2xl font-bold leading-none">{group.name}</h1>
                <p className="text-red-100 text-xs mt-1 opacity-90">{group.description}</p>
            </div>
            {isMeetupUnlocked && (
                <div className="bg-white/20 p-2 rounded-full animate-bounce-slow">
                    <MapPin className="text-white w-6 h-6" />
                </div>
            )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
            <div className="flex justify-between text-xs text-white mb-1 font-bold">
                <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {memberCount}명 참여중</span>
                <span>정원 {group.maxMembers}명</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-xmas-gold h-2.5 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1" 
                    style={{ width: `${(memberCount / group.maxMembers) * 100}%` }}
                >
                    {/* Sparkle effect on bar */}
                </div>
            </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {group.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] text-white whitespace-nowrap">
                    {tag}
                </span>
            ))}
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50 backdrop-blur-sm relative"
      >
        {messages.map((msg, idx) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4 animate-fade-in">
                <span className="bg-slate-700/50 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-600">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.userId === currentUser.id;
          // Simple consistent avatar assignment based on message ID hash or user ID
          const avatarIdx = isMe ? 0 : (msg.userId.split('-')[1] ? parseInt(msg.userId.split('-')[1]) % AVATARS.length : 1);
          
          return (
            <div 
                key={msg.id} 
                className={`flex gap-3 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}
            >
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-slate-600">
                    <img src={isMe ? currentUser.avatar : AVATARS[avatarIdx]} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div 
                        className={`px-4 py-2 rounded-2xl text-sm ${
                            isMe 
                            ? 'bg-xmas-red text-white rounded-tr-sm' 
                            : 'bg-slate-700 text-gray-100 rounded-tl-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-700 z-10">
        <div className="flex gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isMeetupUnlocked ? "정모 장소에 대해 이야기해보세요..." : "솔로 동료들에게 인사해보세요..."}
                className="flex-1 bg-slate-800 text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-xmas-gold placeholder-slate-500 border border-slate-700"
            />
            <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-xmas-green hover:bg-green-700 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Unlock Overlay Modal */}
      {isMeetupUnlocked && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-xmas-gold/90 text-slate-900 px-6 py-2 rounded-full font-bold shadow-xl animate-bounce z-50 flex items-center gap-2 whitespace-nowrap">
              <PartyPopper className="w-5 h-5" />
              정모 확정!
          </div>
      )}
    </div>
  );
};

export default GroupRoom;