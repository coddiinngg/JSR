import React from "react";
import { ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedItem {
  id: string;
  user: string;
  seed: string;
  time: string;
  caption: string;
  groupTitle: string;
  verifyEmoji: string;
  img: string;
  aspect: "tall" | "square";
}

const ALL_FEED_ITEMS: FeedItem[] = [
  {
    id: "1", user: "김지수", seed: "Felix", time: "방금 전",
    caption: "오늘도 13,200보 달성! 연속 28일째 🔥",
    groupTitle: "매일 5,000보 걷기", verifyEmoji: "👟", aspect: "tall",
    img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&fit=crop",
  },
  {
    id: "2", user: "한소희", seed: "Ava", time: "5분 전",
    caption: "이번 주 독서 인증 완료 📚",
    groupTitle: "일일 독서 클럽", verifyEmoji: "📚", aspect: "square",
    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&fit=crop",
  },
  {
    id: "3", user: "강민준", seed: "Leo", time: "11분 전",
    caption: "새벽 한강 러닝 완주! 오늘 풍경 미쳤다 🌅",
    groupTitle: "러닝 크루", verifyEmoji: "🏃", aspect: "square",
    img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&fit=crop",
  },
  {
    id: "4", user: "송민재", seed: "Finn", time: "19분 전",
    caption: "'작은 습관이 큰 변화를 만든다' 오늘의 문장 ✍️",
    groupTitle: "필사 챌린지", verifyEmoji: "✍️", aspect: "tall",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&fit=crop",
  },
  {
    id: "5", user: "윤서아", seed: "Eva", time: "25분 전",
    caption: "오늘의 포즈 도전 완료 ㅎㅎ 쑥스럽지만 재밌어요 📸",
    groupTitle: "포즈 챌린지", verifyEmoji: "📸", aspect: "square",
    img: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&fit=crop",
  },
  {
    id: "6", user: "정서윤", seed: "Ella", time: "34분 전",
    caption: "오늘 광화문 광장 방문 인증! 역시 멋있다 📍",
    groupTitle: "장소 탐험대", verifyEmoji: "📍", aspect: "tall",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&fit=crop",
  },
  {
    id: "7", user: "박민혁", seed: "Aneka", time: "48분 전",
    caption: "점심에 공원 산책 완료 👟 오늘 10,000보 달성!",
    groupTitle: "매일 5,000보 걷기", verifyEmoji: "👟", aspect: "square",
    img: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&fit=crop",
  },
  {
    id: "8", user: "이준혁", seed: "Dan", time: "1시간 전",
    caption: "오늘 반 읽었어요! 오늘 다 끝낼 것 같아요 📖",
    groupTitle: "일일 독서 클럽", verifyEmoji: "📚", aspect: "tall",
    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&fit=crop",
  },
  {
    id: "9", user: "오서연", seed: "Mia", time: "1시간 전",
    caption: "아침 조깅 5km 완주 🏃 상쾌하다!",
    groupTitle: "러닝 크루", verifyEmoji: "🏃", aspect: "square",
    img: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&fit=crop",
  },
  {
    id: "10", user: "이수진", seed: "Sue", time: "2시간 전",
    caption: "손글씨 연습 중 ✍️ 매일 조금씩 늘어가는 것 같아요",
    groupTitle: "필사 챌린지", verifyEmoji: "✍️", aspect: "square",
    img: "https://images.unsplash.com/photo-1471107191679-f26174d2d41e?w=400&fit=crop",
  },
  {
    id: "11", user: "김태양", seed: "Ray", time: "2시간 전",
    caption: "오늘 포즈 도전 ㅋㅋ 같이 해봐요! 📸",
    groupTitle: "포즈 챌린지", verifyEmoji: "📸", aspect: "tall",
    img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&fit=crop",
  },
  {
    id: "12", user: "최민준", seed: "Ace", time: "3시간 전",
    caption: "오늘 인사동 골목 탐험 완료! 숨겨진 카페 발견 ☕",
    groupTitle: "장소 탐험대", verifyEmoji: "📍", aspect: "square",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&fit=crop",
  },
  {
    id: "13", user: "이성민", seed: "Jude", time: "3시간 전",
    caption: "퇴근 후 저녁 산책 🚶 오늘도 목표 달성!",
    groupTitle: "매일 5,000보 걷기", verifyEmoji: "👟", aspect: "tall",
    img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&fit=crop",
  },
  {
    id: "14", user: "정우성", seed: "Owen", time: "4시간 전",
    caption: "이번 주 목표 달성 🎉 독서 챌린지 계속 달려보자!",
    groupTitle: "일일 독서 클럽", verifyEmoji: "📚", aspect: "square",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&fit=crop",
  },
  {
    id: "15", user: "유하늘", seed: "Zoe", time: "5시간 전",
    caption: "한강 달리기 인증 완료 🌅 오늘 7km!",
    groupTitle: "러닝 크루", verifyEmoji: "🏃", aspect: "tall",
    img: "https://images.unsplash.com/photo-1502224562085-639556652f33?w=400&fit=crop",
  },
  {
    id: "16", user: "조현우", seed: "Hugh", time: "6시간 전",
    caption: "오늘 필사한 문구 공유해요 ✍️ 힘이 되는 말이에요",
    groupTitle: "필사 챌린지", verifyEmoji: "✍️", aspect: "square",
    img: "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=400&fit=crop",
  },
];

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-transform cursor-pointer border border-black/[0.04]">
      <div className={`relative ${item.aspect === "tall" ? "aspect-[3/4]" : "aspect-square"}`}>
        <img
          src={item.img}
          alt={item.caption}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="text-[9px] text-white font-bold">{item.time}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
          <span className="text-[10px]">{item.verifyEmoji}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`}
              alt={item.user}
              className="w-5 h-5 rounded-full bg-white/20 shrink-0"
            />
            <span className="text-white text-[11px] font-black truncate">{item.user}</span>
          </div>
          <p className="text-white/75 text-[11px] leading-snug line-clamp-2">{item.caption}</p>
        </div>
      </div>
    </div>
  );
}

export function FeedAll() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <header className="shrink-0 bg-white px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#FF3355,#CC0030)" }}>
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <h1 className="text-[18px] font-black text-slate-900">실시간 인증 피드</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 피드 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-6">
        <div className="grid grid-cols-2 gap-2.5">
          {/* 왼쪽 컬럼 */}
          <div className="flex flex-col gap-2.5">
            {ALL_FEED_ITEMS.filter((_, i) => i % 2 === 0).map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
          {/* 오른쪽 컬럼 — 위로 오프셋 */}
          <div className="flex flex-col gap-2.5 mt-6">
            {ALL_FEED_ITEMS.filter((_, i) => i % 2 === 1).map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
