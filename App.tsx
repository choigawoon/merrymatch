import React, { useState } from 'react';
import { AppState, Group, User } from './types';
import GroupRoom from './components/GroupRoom';
import Snowfall from './components/Snowfall';
import { analyzeWishAndMatch } from './services/geminiService';
import { Gift, Sparkles, Loader2, Heart, Snowflake } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [userWish, setUserWish] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [matchedGroup, setMatchedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    if (!userWish.trim()) return;

    setIsLoading(true);
    setAppState(AppState.MATCHING);

    try {
      // 1. Analyze wish with Gemini
      const matchResult = await analyzeWishAndMatch(userWish);

      // 2. Create User Profile (Simulated)
      const user: User = {
        id: `user-${Date.now()}`,
        name: '나',
        avatar: 'https://picsum.photos/id/65/50/50', // Fixed avatar for demo
        isSelf: true,
      };

      // 3. Create Group based on result
      const group: Group = {
        id: `group-${Date.now()}`,
        name: matchResult.groupName,
        theme: matchResult.theme,
        description: matchResult.description,
        maxMembers: 8,
        currentMembers: matchResult.initialMembers,
        tags: matchResult.tags,
      };

      setCurrentUser(user);
      setMatchedGroup(group);
      
      // Simulate "Finding..." delay for UX
      setTimeout(() => {
        setIsLoading(false);
        setAppState(AppState.GROUP_ROOM);
      }, 2500);

    } catch (error) {
      console.error("Error matching:", error);
      setIsLoading(false);
      setAppState(AppState.LANDING);
      alert("앗! 엘프들이 소원을 떨어뜨렸어요. 다시 시도해주세요.");
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative max-w-md mx-auto">
            <div className="mb-8 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-xmas-red to-xmas-gold rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative bg-slate-900 rounded-full p-4 border-2 border-xmas-gold">
                    <Gift className="w-16 h-16 text-xmas-red" />
                </div>
            </div>
            
            <h1 className="font-christmas text-5xl md:text-6xl text-white mb-2 drop-shadow-lg">
              MerryMatch
            </h1>
            <p className="text-xl text-blue-200 mb-8 font-light">
              크리스마스를 혼자 보내지 마세요.<br/> 당신의 파티를 찾아드립니다.
            </p>

            <div className="w-full bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl">
              <label className="block text-left text-sm font-bold text-xmas-gold mb-2 uppercase tracking-wide">
                크리스마스 소원
              </label>
              <textarea
                value={userWish}
                onChange={(e) => setUserWish(e.target.value)}
                placeholder="예: 집에서 와인 마시면서 나홀로집에 보고 싶어요..."
                className="w-full h-32 bg-slate-900 text-white p-4 rounded-xl border border-slate-600 focus:border-xmas-red focus:ring-1 focus:ring-xmas-red outline-none resize-none mb-4 transition-all"
              />
              <button
                onClick={handleMatch}
                disabled={!userWish.trim()}
                className="w-full bg-xmas-red hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                내 모임 찾기
              </button>
              <p className="text-xs text-slate-400 mt-4">
                AI 산타가 비슷한 솔로들과 매칭해드립니다
              </p>
            </div>
          </div>
        );

      case AppState.MATCHING:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center z-10 relative">
             <div className="mb-6 animate-spin">
                <Loader2 className="w-12 h-12 text-xmas-gold" />
            </div>
            <h2 className="font-christmas text-4xl text-white mb-4">명단 확인 중...</h2>
            <p className="text-blue-200 animate-pulse">취향 분석 중...</p>
            
            <div className="mt-8 flex gap-4 opacity-50">
               <Snowflake className="w-6 h-6 text-white animate-bounce" style={{ animationDelay: '0s' }}/>
               <Snowflake className="w-6 h-6 text-white animate-bounce" style={{ animationDelay: '0.2s' }}/>
               <Snowflake className="w-6 h-6 text-white animate-bounce" style={{ animationDelay: '0.4s' }}/>
            </div>
          </div>
        );

      case AppState.GROUP_ROOM:
        if (!matchedGroup || !currentUser) return null;
        return <GroupRoom group={matchedGroup} currentUser={currentUser} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
      <Snowfall />
      {renderContent()}
    </div>
  );
}

export default App;