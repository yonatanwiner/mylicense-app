import React, { useState, useEffect } from 'react';
import { Car, BookOpen, Calendar, Star, Camera, Share2, Award, Clock, User, Settings, Plus, TrendingUp, Check, X, Heart, MessageCircle, ChevronRight, LogOut, Target, Trophy, Users, DollarSign, Bell } from 'lucide-react';

// ============ ACHIEVEMENTS DEFINITIONS ============
const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🚗', title: 'שיעור ראשון', desc: 'התחלת את המסע!', check: (d) => (d.lessons || []).length >= 1 },
  { id: 'lessons_5', icon: '⭐', title: '5 שיעורים', desc: 'מתקדם יפה', check: (d) => (d.lessons || []).length >= 5 },
  { id: 'lessons_10', icon: '🔥', title: '10 שיעורים', desc: 'מחצי הדרך!', check: (d) => (d.lessons || []).length >= 10 },
  { id: 'lessons_20', icon: '💪', title: '20 שיעורים', desc: 'ותיק כבר', check: (d) => (d.lessons || []).length >= 20 },
  { id: 'min_lessons', icon: '🎯', title: 'מינימום 28', desc: 'זכאי לגשת לטסט!', check: (d) => (d.lessons || []).length >= 28 },
  { id: 'theory', icon: '📚', title: 'עברתי תיאוריה', desc: 'הראש עובד!', check: (d) => d.theoryPassed },
  { id: 'internal', icon: '✅', title: 'טסט פנימי', desc: 'המורה סומך עליך', check: (d) => d.internalTestPassed },
  { id: 'license', icon: '🏆', title: 'רישיון נהיגה!', desc: 'הגעת ליעד!', check: (d) => d.licenseIssued },
  { id: 'perfect_rating', icon: '🌟', title: 'שיעור מושלם', desc: '5 כוכבים על שיעור', check: (d) => (d.lessons || []).some(l => l.rating === 5) },
  { id: 'photographer', icon: '📸', title: 'צלם', desc: 'הוספת תמונה לשיעור', check: (d) => (d.lessons || []).some(l => l.photo) },
  { id: 'social', icon: '📢', title: 'חברותי', desc: 'שיתפת שיעור בפיד', check: (d) => (d.lessons || []).some(l => l.shareToFeed) },
  { id: 'diligent', icon: '📖', title: 'שקדן', desc: '5 שיעורים עם רישום מה למדת', check: (d) => (d.lessons || []).filter(l => l.learned && l.learned.trim()).length >= 5 },
];

const getUnlockedAchievements = (userData) => ACHIEVEMENTS.filter(a => a.check(userData));

const calculateProgress = (data) => {
  let total = 0;
  if (data.theoryPassed) total += 20;
  if (data.lessons && data.lessons.length > 0) total += Math.min(40, data.lessons.length * 2);
  if (data.internalTestPassed) total += 10;
  if (data.practicalTestPassed) total += 20;
  if (data.licenseIssued) total += 10;
  return Math.min(100, total);
};

// ============ AVATAR PICKER ============
const EMOJI_OPTIONS = [
  '😎','🚗','🏎️','🚙','🤩','💪','🔥','⭐','🎯','🏆',
  '🦁','🐯','🐺','🦊','🐸','🐧','🦋','🐬','🦅','🐲',
  '🍕','🍦','🎮','🎸','⚽','🏀','🎾','🛹','🎨','🎤',
];

const AvatarDisplay = ({ avatar, name, size = 'md' }) => {
  const sizes = {
    sm: { outer: 'w-10 h-10', text: 'text-xl', img: 'w-10 h-10' },
    md: { outer: 'w-16 h-16', text: 'text-3xl', img: 'w-16 h-16' },
    lg: { outer: 'w-20 h-20', text: 'text-4xl', img: 'w-20 h-20' },
  };
  const s = sizes[size];
  if (avatar?.type === 'photo') {
    return (
      <div className={`${s.img} border-4 border-black overflow-hidden flex-shrink-0`}>
        <img src={avatar.data} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (avatar?.type === 'emoji') {
    return (
      <div className={`${s.outer} bg-yellow-300 border-4 border-black flex items-center justify-center flex-shrink-0`}>
        <span className={s.text}>{avatar.emoji}</span>
      </div>
    );
  }
  // ברירת מחדל - ראשית שם
  return (
    <div className={`${s.outer} bg-yellow-300 border-4 border-black flex items-center justify-center flex-shrink-0`}>
      <span className={`${s.text} font-black`}>{(name || '?').charAt(0)}</span>
    </div>
  );
};

const AvatarPickerModal = ({ currentAvatar, name, onSave, onClose }) => {
  const [tab, setTab] = useState('emoji'); // 'emoji' | 'photo'
  const [selected, setSelected] = useState(currentAvatar || null);
  const [photoPreview, setPhotoPreview] = useState(currentAvatar?.type === 'photo' ? currentAvatar.data : null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setSelected({ type: 'photo', data: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50 p-0">
      <div className="bg-white border-t-4 border-x-4 border-black w-full max-w-lg shadow-[0px_-8px_0px_0px_rgba(0,0,0,1)] pb-8">
        <div className="flex justify-between items-center p-5 border-b-4 border-black">
          <h2 className="text-2xl font-black">בחר תמונת פרופיל</h2>
          <button onClick={onClose} className="bg-stone-200 border-2 border-black p-1"><X size={20} /></button>
        </div>

        {/* תצוגה מקדימה */}
        <div className="flex justify-center py-4 border-b-4 border-black bg-yellow-50">
          <AvatarDisplay avatar={selected} name={name} size="lg" />
        </div>

        {/* טאבים */}
        <div className="grid grid-cols-2 border-b-4 border-black">
          <button onClick={() => setTab('emoji')}
            className={`py-3 font-black text-lg border-l-2 border-black ${tab === 'emoji' ? 'bg-yellow-300' : 'bg-white'}`}>
            😎 אימוג'י
          </button>
          <button onClick={() => setTab('photo')}
            className={`py-3 font-black text-lg ${tab === 'photo' ? 'bg-yellow-300' : 'bg-white'}`}>
            📷 תמונה
          </button>
        </div>

        <div className="p-4">
          {tab === 'emoji' && (
            <div className="grid grid-cols-6 gap-2 mb-4">
              {EMOJI_OPTIONS.map(emoji => (
                <button key={emoji} onClick={() => setSelected({ type: 'emoji', emoji })}
                  className={`text-3xl p-2 border-4 rounded-none transition-all ${
                    selected?.type === 'emoji' && selected.emoji === emoji
                      ? 'border-black bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-transparent hover:border-stone-300'
                  }`}>
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {tab === 'photo' && (
            <div className="space-y-4">
              <label className="block w-full cursor-pointer">
                <div className="bg-stone-100 border-4 border-dashed border-black p-6 text-center font-black hover:bg-yellow-50">
                  📱 לחץ לצילום או בחירה מהגלריה
                </div>
                <input type="file" accept="image/*" capture="environment"
                  onChange={handlePhoto} className="hidden" />
              </label>
              {photoPreview && (
                <div className="border-4 border-black overflow-hidden">
                  <img src={photoPreview} alt="preview" className="w-full max-h-48 object-cover" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {currentAvatar && (
              <button onClick={() => { onSave(null); onClose(); }}
                className="flex-1 bg-stone-200 border-4 border-black font-bold py-3">
                הסר תמונה
              </button>
            )}
            <button onClick={() => { if (selected) { onSave(selected); onClose(); } }}
              disabled={!selected}
              className="flex-1 bg-black text-yellow-300 border-4 border-black font-black py-3 disabled:opacity-40">
              שמור ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LOGIN SCREEN ============
const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const handleStart = async () => {
    if (!name.trim()) return;
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const newUser = { id: userId, name: name.trim(), city: city.trim(), joinedAt: new Date().toISOString() };
    try { await window.storage.set('current_user', JSON.stringify(newUser)); } catch (e) { console.error(e); }
    try {
      await window.storage.set(`publicuser:${userId}`, JSON.stringify({
        id: userId, name: newUser.name, city: newUser.city, joinedAt: newUser.joinedAt,
        lessonCount: 0, progress: 0, theoryPassed: false, licenseIssued: false, achievementsCount: 0
      }), true);
    } catch (e) { console.error(e); }
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)'
    }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-block mb-4 transform -rotate-3">
            <div className="bg-black text-yellow-300 px-6 py-3 text-4xl font-black tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              MyLicense
            </div>
          </div>
          <p className="text-xl font-bold text-stone-800 mt-6">הדרך שלך לרישיון 🚗</p>
          <p className="text-sm text-stone-600 mt-2">מהשיעור הראשון ועד סיום תקופת נהג חדש</p>
        </div>
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-2xl font-black mb-4">בוא נתחיל!</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">איך קוראים לך?</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="השם שלך"
                className="w-full border-2 border-black p-3 text-lg font-medium focus:outline-none focus:bg-yellow-50" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">עיר (אופציונלי)</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="באיזו עיר אתה לומד?"
                className="w-full border-2 border-black p-3 text-lg font-medium focus:outline-none focus:bg-yellow-50" />
            </div>
            <button onClick={handleStart} disabled={!name.trim()}
              className="w-full bg-black text-yellow-300 font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] hover:shadow-[2px_2px_0px_0px_rgba(250,204,21,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              בוא נצא לדרך ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MINI BAR CHART ============
const LessonsChart = ({ lessons }) => {
  if (!lessons || lessons.length === 0) return null;
  const byMonth = {};
  lessons.forEach(l => {
    const d = new Date(l.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const sortedKeys = Object.keys(byMonth).sort();
  const values = sortedKeys.map(k => byMonth[k]);
  const maxVal = Math.max(...values, 1);
  const monthLabel = (key) => {
    const [, month] = key.split('-');
    const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    return months[parseInt(month) - 1];
  };

  return (
    <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-lg mb-3 flex items-center gap-2">
        <TrendingUp size={20} /> שיעורים לפי חודש
      </h3>
      <div className="flex items-end gap-2 h-32 border-b-4 border-black pb-1">
        {sortedKeys.map((k) => (
          <div key={k} className="flex-1 flex flex-col items-center justify-end">
            <div className="text-xs font-black mb-1">{byMonth[k]}</div>
            <div className="w-full bg-black border-2 border-black"
              style={{ height: `${(byMonth[k] / maxVal) * 90}%`, minHeight: '8px' }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {sortedKeys.map(k => (
          <div key={k} className="flex-1 text-center text-xs font-bold">{monthLabel(k)}</div>
        ))}
      </div>
    </div>
  );
};

// ============ CELEBRATION MODAL ============
const CelebrationModal = ({ type, onClose }) => {
  const content = {
    passed: {
      bg: 'bg-lime-300', emoji: '🎉🎊🏆', title: 'עברת!',
      msg: 'כל הכבוד! העבודה הקשה השתלמה. אתה עולה שלב - תהנה מהרגע הזה!',
      btn: 'תודה! 🙏'
    },
    failed: {
      bg: 'bg-cyan-300', emoji: '💪❤️🌟', title: 'זה לא הסוף',
      msg: 'גם אלופים נופלים לפני שהם קמים. כל ניסיון מקרב אותך לרישיון. תנוח, תלמד מה לשפר, ותחזור חזק יותר!',
      btn: 'קדימה לנסיון הבא! 💪'
    }
  };
  const c = content[type];
  if (!c) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${c.bg} border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
        <div className="text-center">
          <div className="text-6xl mb-3">{c.emoji}</div>
          <h2 className="text-3xl font-black mb-3">{c.title}</h2>
          <p className="font-bold mb-6">{c.msg}</p>
          <button onClick={onClose}
            className="w-full bg-black text-white font-black text-lg py-3 border-4 border-black">
            {c.btn}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ HOME SCREEN ============
const HomeScreen = ({ user, userData, onNavigate }) => {
  const progress = calculateProgress(userData);
  const lessons = userData.lessons || [];
  const lessonCount = lessons.length;
  const unlockedCount = getUnlockedAchievements(userData).length;
  const MIN_LESSONS = 28;
  const lessonsLeft = Math.max(0, MIN_LESSONS - lessonCount);
  const extraLessons = Math.max(0, lessonCount - MIN_LESSONS);

  const getTestCountdown = () => {
    if (!userData.testDate) return null;
    const testDate = new Date(userData.testDate);
    const now = new Date();
    const daysLeft = Math.ceil((testDate - now) / (1000 * 60 * 60 * 24));
    return { testDate, daysLeft };
  };

  const getNewDriverInfo = () => {
    if (!userData.licenseIssueDate) return null;
    const issueDate = new Date(userData.licenseIssueDate);
    const endDate = new Date(issueDate);
    endDate.setFullYear(endDate.getFullYear() + 2);
    const now = new Date();
    const totalMs = endDate - issueDate;
    const elapsedMs = now - issueDate;
    const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    return { endDate, daysLeft, percent };
  };

  const testCountdown = getTestCountdown();
  const newDriverInfo = getNewDriverInfo();

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('avatar')} className="relative">
            <AvatarDisplay avatar={userData.avatar} name={user.name} size="md" />
            <div className="absolute -bottom-1 -right-1 bg-yellow-300 border-2 border-black rounded-full w-6 h-6 flex items-center justify-center text-xs">✏️</div>
          </button>
          <div>
            <p className="text-sm font-bold text-stone-600">שלום,</p>
            <h1 className="text-2xl font-black">{user.name} 👋</h1>
          </div>
        </div>
        <button onClick={() => onNavigate('settings')}
          className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Settings size={24} />
        </button>
      </div>

      <div className="bg-yellow-300 border-4 border-black p-6 mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-black">ההתקדמות שלך</h2>
          <span className="text-3xl font-black">{progress}%</span>
        </div>
        <div className="w-full h-8 bg-white border-2 border-black overflow-hidden">
          <div className="h-full bg-black transition-all duration-500 flex items-center justify-end pl-2"
            style={{ width: `${progress}%` }}>
            {progress > 15 && <Car size={20} className="text-yellow-300" />}
          </div>
        </div>
        <p className="text-sm font-bold mt-3">
          {progress === 0 && 'בוא נתחיל את המסע!'}
          {progress > 0 && progress < 30 && 'אתה בדרך הנכונה 💪'}
          {progress >= 30 && progress < 60 && 'מתקדם יפה!'}
          {progress >= 60 && progress < 100 && 'כמעט שם!'}
          {progress === 100 && 'כל הכבוד! יש לך רישיון 🎉'}
        </p>
      </div>

      {!userData.licenseIssued && (
        <div className="bg-orange-300 border-4 border-black p-5 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2">
            <Target size={24} />
            <h3 className="font-black text-lg">מינימום שיעורים לטסט</h3>
          </div>
          {lessonsLeft > 0 ? (
            <>
              <p className="text-sm font-bold mb-2">
                עוד <span className="text-2xl">{lessonsLeft}</span> שיעורים עד שתוכל לגשת לטסט
              </p>
              <div className="w-full h-5 bg-white border-2 border-black overflow-hidden">
                <div className="h-full bg-black flex items-center justify-center text-xs font-black text-orange-300"
                  style={{ width: `${(lessonCount / MIN_LESSONS) * 100}%` }}>
                  {lessonCount > 3 && `${lessonCount}/${MIN_LESSONS}`}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold mb-1">✅ יש לך {lessonCount} שיעורים - זכאי לגשת לטסט!</p>
              {extraLessons > 0 && (
                <p className="text-xs font-bold">({extraLessons} שיעורי אקסטרה מעבר למינימום)</p>
              )}
            </>
          )}
        </div>
      )}

      {testCountdown && !userData.practicalTestPassed && (
        <div className={`border-4 border-black p-5 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
          testCountdown.daysLeft < 0 ? 'bg-stone-200' :
          testCountdown.daysLeft <= 3 ? 'bg-red-300' :
          testCountdown.daysLeft <= 7 ? 'bg-orange-300' : 'bg-cyan-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={24} />
            <h3 className="font-black text-lg">הטסט שלך 🎯</h3>
          </div>
          {testCountdown.daysLeft > 0 ? (
            <>
              <p className="text-4xl font-black">{testCountdown.daysLeft}</p>
              <p className="text-sm font-bold">ימים עד הטסט</p>
              <p className="text-xs mt-1">{testCountdown.testDate.toLocaleDateString('he-IL')}</p>
            </>
          ) : testCountdown.daysLeft === 0 ? (
            <p className="text-2xl font-black">הטסט היום! בהצלחה 🍀</p>
          ) : (
            <p className="font-bold">הטסט היה ב-{testCountdown.testDate.toLocaleDateString('he-IL')}. סמן תוצאה ב"השלבים שלי"</p>
          )}
        </div>
      )}

      {newDriverInfo && (
        <div className="bg-lime-300 border-4 border-black p-5 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={24} />
            <h3 className="font-black text-lg">תקופת נהג חדש</h3>
          </div>
          <p className="text-sm font-bold mb-2">עוד {newDriverInfo.daysLeft} ימים</p>
          <div className="w-full h-4 bg-white border-2 border-black overflow-hidden">
            <div className="h-full bg-black" style={{ width: `${newDriverInfo.percent}%` }} />
          </div>
          <p className="text-xs mt-2 font-medium">מסיים ב-{newDriverInfo.endDate.toLocaleDateString('he-IL')}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <BookOpen size={20} className="mb-1" />
          <p className="text-2xl font-black">{lessonCount}</p>
          <p className="text-xs font-bold">שיעורים</p>
        </div>
        <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Trophy size={20} className="mb-1" />
          <p className="text-2xl font-black">{unlockedCount}</p>
          <p className="text-xs font-bold">הישגים</p>
        </div>
        <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DollarSign size={20} className="mb-1" />
          <p className="text-xl font-black">{(userData.totalSpent || 0).toLocaleString('he-IL')}</p>
          <p className="text-xs font-bold">₪ הוצאה</p>
        </div>
      </div>

      {lessons.length > 0 && (
        <div className="mb-4">
          <LessonsChart lessons={lessons} />
        </div>
      )}

      <div className="space-y-3">
        <button onClick={() => onNavigate('journey')}
          className="w-full bg-black text-yellow-300 p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(132,204,22,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><TrendingUp size={24} /><span>השלבים שלי</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('lessons')}
          className="w-full bg-white text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><BookOpen size={24} /><span>יומן שיעורים</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('achievements')}
          className="w-full bg-yellow-300 text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><Trophy size={24} /><span>הישגים ({unlockedCount}/{ACHIEVEMENTS.length})</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('teachers')}
          className="w-full bg-pink-300 text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><Star size={24} /><span>מורים ודירוגים</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('friends')}
          className="w-full bg-purple-300 text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><Users size={24} /><span>השוואה עם חברים</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('reminders')}
          className="w-full bg-orange-300 text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><Bell size={24} /><span>תזכורות</span></div>
          <ChevronRight size={24} />
        </button>
        <button onClick={() => onNavigate('feed')}
          className="w-full bg-cyan-300 text-black p-4 font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <div className="flex items-center gap-3"><Share2 size={24} /><span>פיד חברתי</span></div>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

// ============ JOURNEY SCREEN ============
const JourneyScreen = ({ userData, updateUserData, onBack }) => {
  const [celebration, setCelebration] = useState(null);

  const stages = [
    { key: 'registered', title: 'נרשמתי לבית ספר לנהיגה', icon: '📝', desc: 'תחילת התהליך' },
    { key: 'firstLesson', title: 'שיעור ראשון', icon: '🚗', desc: 'התחלת הלימודים' },
    { key: 'theoryPassed', title: 'עברתי תיאוריה', icon: '📚', desc: 'מבחן תיאוריה הושלם', canFail: true },
    { key: 'internalTestPassed', title: 'עברתי טסט פנימי', icon: '✅', desc: 'המורה נתן אישור', canFail: true },
    { key: 'practicalTestPassed', title: 'עברתי טסט חיצוני', icon: '🎯', desc: 'המבחן הסופי', canFail: true },
    { key: 'licenseIssued', title: 'קיבלתי רישיון!', icon: '🎉', desc: 'סיימתי את התהליך' },
  ];

  const markStage = (key, result) => {
    const newData = { ...userData };
    if (result === 'passed') {
      newData[key] = true;
      setCelebration('passed');
    } else if (result === 'failed') {
      newData.failedAttempts = newData.failedAttempts || {};
      newData.failedAttempts[key] = (newData.failedAttempts[key] || 0) + 1;
      setCelebration('failed');
    } else {
      newData[key] = !userData[key];
    }
    updateUserData(newData);
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-6">השלבים שלי 🛣️</h1>

      <div className="bg-cyan-200 border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={20} />
          <h3 className="font-black">תאריך טסט קבוע</h3>
        </div>
        <input type="date" value={userData.testDate || ''}
          onChange={(e) => updateUserData({ ...userData, testDate: e.target.value })}
          className="w-full border-2 border-black p-2 font-bold" />
        {userData.testDate && (
          <p className="text-xs font-bold mt-2">הספירה לאחור תופיע במסך הבית</p>
        )}
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const isChecked = userData[stage.key];
          const failedCount = userData.failedAttempts?.[stage.key] || 0;
          return (
            <div key={stage.key}
              className={`border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                isChecked ? 'bg-lime-300' : 'bg-white'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 border-4 border-black flex items-center justify-center text-2xl flex-shrink-0 ${
                  isChecked ? 'bg-black text-lime-300' : 'bg-yellow-300'
                }`}>
                  {isChecked ? <Check size={28} strokeWidth={4} /> : stage.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg">{stage.title}</h3>
                  <p className="text-xs font-bold text-stone-700">{stage.desc}</p>
                  {failedCount > 0 && !isChecked && (
                    <p className="text-xs font-bold text-red-600 mt-1">נסיונות קודמים: {failedCount}</p>
                  )}
                </div>
              </div>

              {stage.canFail && !isChecked && (
                <div className="mt-3 pt-3 border-t-2 border-black flex gap-2">
                  <button onClick={() => markStage(stage.key, 'passed')}
                    className="flex-1 bg-lime-300 border-2 border-black font-black py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    ✅ עברתי!
                  </button>
                  <button onClick={() => markStage(stage.key, 'failed')}
                    className="flex-1 bg-stone-200 border-2 border-black font-bold py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    😔 לא הפעם
                  </button>
                </div>
              )}

              {!stage.canFail && (
                <div className="mt-3 pt-3 border-t-2 border-black">
                  <button onClick={() => markStage(stage.key, 'toggle')}
                    className={`w-full border-2 border-black font-bold py-2 ${
                      isChecked ? 'bg-white' : 'bg-yellow-300'
                    }`}>
                    {isChecked ? '✗ בטל סימון' : '✓ סמן כהושלם'}
                  </button>
                </div>
              )}

              {stage.key === 'licenseIssued' && isChecked && (
                <div className="mt-3 pt-3 border-t-2 border-black">
                  <label className="block text-xs font-bold mb-1">תאריך קבלת רישיון:</label>
                  <input type="date" value={userData.licenseIssueDate || ''}
                    onChange={(e) => updateUserData({ ...userData, licenseIssueDate: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-orange-200 border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-lg mb-2">ℹ️ מה זה "נהג חדש"?</h3>
        <p className="text-sm font-medium leading-relaxed">
          בישראל, נהג חדש הוא מי שקיבל רישיון לפני פחות משנתיים.
          בחודשיים הראשונים חובה ליסוע עם מלווה (בן משפחה מעל 24 עם ותק 5 שנים, או מעל 30 עם ותק 3 שנים).
          עד גיל 21 אסור להסיע יותר מ-2 נוסעים מתחת לגיל 21 בלי מלווה.
        </p>
      </div>

      {celebration && <CelebrationModal type={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

// ============ LESSONS SCREEN ============
const LessonsScreen = ({ user, userData, updateUserData, onBack }) => {
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [viewLesson, setViewLesson] = useState(null);
  const lessons = userData.lessons || [];
  const MIN_LESSONS = 28;

  const addLesson = async (lesson) => {
    const newLesson = { ...lesson, id: 'lesson_' + Date.now(), createdAt: new Date().toISOString() };
    const newLessons = [newLesson, ...lessons];
    const newTotal = (userData.totalSpent || 0) + (parseFloat(lesson.cost) || 0);
    const newData = { ...userData, lessons: newLessons, totalSpent: newTotal };
    await updateUserData(newData);

    if (lesson.shareToFeed) {
      try {
        const feedPost = {
          id: 'post_' + Date.now(), userId: user.id, userName: user.name, userCity: user.city,
          type: 'lesson', lessonNumber: newLessons.length, rating: lesson.rating,
          notes: lesson.notes, photo: lesson.photo, teacherName: userData.teacherName,
          createdAt: new Date().toISOString(), likes: 0,
        };
        await window.storage.set(`feed:${feedPost.id}`, JSON.stringify(feedPost), true);
      } catch (e) { console.error(e); }
    }
    setShowAddLesson(false);
  };

  const deleteLesson = async (id) => {
    const lesson = lessons.find(l => l.id === id);
    const newLessons = lessons.filter(l => l.id !== id);
    const newTotal = Math.max(0, (userData.totalSpent || 0) - (parseFloat(lesson?.cost) || 0));
    await updateUserData({ ...userData, lessons: newLessons, totalSpent: newTotal });
    setViewLesson(null);
  };

  if (showAddLesson) {
    return <AddLessonForm onSave={addLesson} onCancel={() => setShowAddLesson(false)}
      lessonNumber={lessons.length + 1} defaultCost={userData.teacherLessonCost || ''} />;
  }
  if (viewLesson) return <LessonDetail lesson={viewLesson} onBack={() => setViewLesson(null)} onDelete={deleteLesson} />;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-black">יומן שיעורים 📖</h1>
        <button onClick={() => setShowAddLesson(true)}
          className="bg-black text-yellow-300 p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <Plus size={24} strokeWidth={4} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold">סה"כ שיעורים</p>
          <p className="text-2xl font-black">{lessons.length}</p>
          <p className="text-xs font-bold">
            {lessons.length < MIN_LESSONS ? `עוד ${MIN_LESSONS - lessons.length} למינימום` : `+${lessons.length - MIN_LESSONS} מעל המינימום`}
          </p>
        </div>
        <div className="bg-pink-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold">הוצאה כוללת</p>
          <p className="text-2xl font-black">₪{(userData.totalSpent || 0).toLocaleString('he-IL')}</p>
          <p className="text-xs font-bold">על {lessons.filter(l => l.cost).length} שיעורים</p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <BookOpen size={48} className="mx-auto mb-4" />
          <h3 className="font-black text-xl mb-2">עדיין אין שיעורים</h3>
          <p className="font-medium text-stone-700 mb-4">תיעד את השיעור הראשון שלך!</p>
          <button onClick={() => setShowAddLesson(true)}
            className="bg-yellow-300 text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            + הוסף שיעור
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <button key={lesson.id} onClick={() => setViewLesson(lesson)}
              className="w-full bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-right hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-stone-600">שיעור #{lessons.length - idx}</p>
                  <p className="font-black text-lg">{new Date(lesson.date).toLocaleDateString('he-IL')}</p>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} fill={i <= lesson.rating ? '#000' : 'none'} />
                  ))}
                </div>
              </div>
              {lesson.topic && <p className="font-bold text-sm mb-1">📍 {lesson.topic}</p>}
              {lesson.notes && <p className="text-sm text-stone-700 line-clamp-2">{lesson.notes}</p>}
              <div className="flex gap-2 mt-2 text-xs font-bold">
                {lesson.photo && <span>📷 תמונה</span>}
                {lesson.cost && <span>💰 ₪{lesson.cost}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddLessonForm = ({ onSave, onCancel, lessonNumber, defaultCost }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('40');
  const [topic, setTopic] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [learned, setLearned] = useState('');
  const [photo, setPhoto] = useState(null);
  const [cost, setCost] = useState(defaultCost || '');
  const [shareToFeed, setShareToFeed] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!date || rating === 0) {
      alert('צריך לפחות תאריך ודירוג');
      return;
    }
    onSave({ date, duration, topic, rating, notes, learned, photo, cost, shareToFeed });
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onCancel} className="mb-4 font-bold">← ביטול</button>
      <h1 className="text-3xl font-black mb-6">שיעור חדש #{lessonNumber}</h1>
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div>
          <label className="block font-bold mb-1">תאריך</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">משך (דקות)</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
            className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">נושא השיעור</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="לדוגמה: חניה בניצב, כביש מהיר..."
            className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">💰 עלות השיעור (₪)</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)}
            placeholder="כמה עלה השיעור"
            className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-2">איך היה השיעור? ⭐</label>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setRating(i)}
                className={`w-12 h-12 border-4 border-black flex items-center justify-center ${i <= rating ? 'bg-yellow-300' : 'bg-white'}`}>
                <Star size={24} fill={i <= rating ? '#000' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1">מה למדתי היום?</label>
          <textarea value={learned} onChange={e => setLearned(e.target.value)}
            placeholder="כתוב משהו שלמדת..." rows="3"
            className="w-full border-2 border-black p-3 font-medium" />
        </div>
        <div>
          <label className="block font-bold mb-1">הערות נוספות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="מה קרה בשיעור..." rows="3"
            className="w-full border-2 border-black p-3 font-medium" />
        </div>
        <div>
          <label className="block font-bold mb-1">📷 תמונה מהשיעור</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange}
            className="w-full border-2 border-black p-2 font-bold" />
          {photo && (
            <div className="mt-2 border-2 border-black p-2">
              <img src={photo} alt="preview" className="w-full max-h-48 object-cover" />
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-cyan-100 border-2 border-black p-3">
          <input type="checkbox" checked={shareToFeed} onChange={e => setShareToFeed(e.target.checked)}
            className="w-5 h-5" />
          <span className="font-bold">📢 שתף עם חברים בפיד</span>
        </label>
        <button onClick={handleSave}
          className="w-full bg-black text-yellow-300 font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          שמור שיעור ✓
        </button>
      </div>
    </div>
  );
};

const LessonDetail = ({ lesson, onBack, onDelete }) => {
  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה ליומן</button>
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-bold text-stone-600">
          {new Date(lesson.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {lesson.topic && <h2 className="text-2xl font-black mt-2 mb-3">{lesson.topic}</h2>}
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={24} fill={i <= lesson.rating ? '#FACC15' : 'none'} stroke="#000" strokeWidth={2} />
          ))}
        </div>
        {lesson.photo && (
          <div className="border-4 border-black mb-4">
            <img src={lesson.photo} alt="lesson" className="w-full" />
          </div>
        )}
        {lesson.learned && (
          <div className="bg-lime-100 border-2 border-black p-3 mb-3">
            <p className="font-black text-sm mb-1">💡 מה למדתי:</p>
            <p className="font-medium">{lesson.learned}</p>
          </div>
        )}
        {lesson.notes && (
          <div className="bg-yellow-100 border-2 border-black p-3 mb-3">
            <p className="font-black text-sm mb-1">📝 הערות:</p>
            <p className="font-medium">{lesson.notes}</p>
          </div>
        )}
        <div className="flex gap-4 text-sm font-bold text-stone-700">
          {lesson.duration && <p>⏱️ {lesson.duration} דקות</p>}
          {lesson.cost && <p>💰 ₪{lesson.cost}</p>}
        </div>
      </div>
      <button onClick={() => { if (confirm('למחוק את השיעור?')) onDelete(lesson.id); }}
        className="w-full mt-4 bg-red-300 text-black font-black py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        🗑️ מחק שיעור
      </button>
    </div>
  );
};

// ============ ACHIEVEMENTS SCREEN ============
const AchievementsScreen = ({ userData, onBack }) => {
  const unlocked = new Set(getUnlockedAchievements(userData).map(a => a.id));

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-2">הישגים 🏆</h1>
      <p className="font-bold text-stone-600 mb-6">{unlocked.size} מתוך {ACHIEVEMENTS.length}</p>
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div key={a.id}
              className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center ${
                isUnlocked ? 'bg-yellow-300' : 'bg-stone-200 opacity-60'
              }`}>
              <div className={`text-5xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>{a.icon}</div>
              <h3 className="font-black text-sm">{a.title}</h3>
              <p className="text-xs font-bold text-stone-700 mt-1">{a.desc}</p>
              {isUnlocked && <div className="mt-2 text-xs font-black">✓ הושג!</div>}
              {!isUnlocked && <div className="mt-2 text-xs font-bold text-stone-500">🔒 נעול</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ TEACHERS SCREEN ============
const TeachersScreen = ({ user, userData, updateUserData, onBack }) => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyTeacher, setShowMyTeacher] = useState(false);
  const [showAddRating, setShowAddRating] = useState(null);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const list = await window.storage.list('teacher:', true);
      const keys = list?.keys || [];
      const teachers = [];
      for (const key of keys) {
        try {
          const res = await window.storage.get(key, true);
          if (res?.value) teachers.push(JSON.parse(res.value));
        } catch (e) {}
      }
      setAllTeachers(teachers);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadTeachers(); }, []);

  const saveMyTeacher = async (teacher) => {
    await updateUserData({
      ...userData, teacherName: teacher.name, teacherCar: teacher.car,
      gearType: teacher.gearType, teacherLessonCost: teacher.lessonCost
    });
    const teacherId = 'teacher:' + teacher.name.replace(/\s+/g, '_').toLowerCase();
    try {
      const existing = await window.storage.get(teacherId, true);
      let teacherData = existing?.value ? JSON.parse(existing.value) : {
        id: teacherId, name: teacher.name, car: teacher.car, city: teacher.city || '',
        lessonCost: teacher.lessonCost || '', ratings: [], createdAt: new Date().toISOString()
      };
      teacherData.car = teacher.car;
      if (teacher.city) teacherData.city = teacher.city;
      if (teacher.lessonCost) teacherData.lessonCost = teacher.lessonCost;
      await window.storage.set(teacherId, JSON.stringify(teacherData), true);
    } catch (e) { console.error(e); }
    setShowMyTeacher(false);
    loadTeachers();
  };

  const addRating = async (teacher, stars, comment) => {
    try {
      const existing = await window.storage.get(teacher.id, true);
      const teacherData = JSON.parse(existing.value);
      teacherData.ratings = (teacherData.ratings || []).filter(r => r.userId !== user.id);
      teacherData.ratings.push({
        userId: user.id, userName: user.name, stars, comment,
        createdAt: new Date().toISOString()
      });
      await window.storage.set(teacher.id, JSON.stringify(teacherData), true);
      setShowAddRating(null);
      loadTeachers();
    } catch (e) { console.error(e); }
  };

  const avgRating = (t) => {
    const r = t.ratings || [];
    if (!r.length) return 0;
    return (r.reduce((s, x) => s + x.stars, 0) / r.length).toFixed(1);
  };

  if (showMyTeacher) return <MyTeacherForm current={userData} onSave={saveMyTeacher} onCancel={() => setShowMyTeacher(false)} />;
  if (showAddRating) return <AddRatingForm teacher={showAddRating} onSave={addRating} onCancel={() => setShowAddRating(null)} />;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-4">מורים לנהיגה ⭐</h1>

      <div className="bg-pink-300 border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-black text-sm mb-1">🚗 המורה שלי</p>
        {userData.teacherName ? (
          <div>
            <p className="text-xl font-black">{userData.teacherName}</p>
            {userData.teacherCar && <p className="font-bold">🚙 {userData.teacherCar}</p>}
            {userData.gearType && <p className="font-bold text-sm">⚙️ {userData.gearType === 'manual' ? 'ידני' : 'אוטומטי'}</p>}
            {userData.teacherLessonCost && <p className="font-bold text-sm">💰 ₪{userData.teacherLessonCost} לשיעור</p>}
            <button onClick={() => setShowMyTeacher(true)}
              className="mt-2 bg-black text-pink-300 px-4 py-2 font-bold border-2 border-black">
              ערוך פרטים
            </button>
          </div>
        ) : (
          <button onClick={() => setShowMyTeacher(true)}
            className="bg-black text-pink-300 px-4 py-2 font-black border-2 border-black mt-2">
            + הוסף את המורה שלי
          </button>
        )}
      </div>

      <h2 className="font-black text-xl mb-3">כל המורים בקהילה 👥</h2>

      {loading ? <p className="text-center font-bold py-8">טוען...</p> :
       allTeachers.length === 0 ? (
        <div className="bg-white border-4 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold">אין עדיין מורים רשומים.</p>
          <p className="text-sm mt-2">הוסף את המורה שלך ותהיה הראשון!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allTeachers.sort((a, b) => avgRating(b) - avgRating(a)).map(t => (
            <div key={t.id} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-black text-lg">{t.name}</h3>
                  {t.car && <p className="text-sm font-bold">🚙 {t.car}</p>}
                  {t.city && <p className="text-xs font-bold text-stone-600">📍 {t.city}</p>}
                  {t.lessonCost && <p className="text-xs font-bold text-green-700">💰 ₪{t.lessonCost} לשיעור</p>}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black">{avgRating(t) || '—'}</div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={12} fill={i <= Math.round(avgRating(t)) ? '#FACC15' : 'none'} stroke="#000" />
                    ))}
                  </div>
                  <p className="text-xs font-bold">{(t.ratings || []).length} דירוגים</p>
                </div>
              </div>
              {(t.ratings || []).filter(r => r.comment).slice(-2).map((r, i) => (
                <div key={i} className="mt-2 bg-yellow-100 border-2 border-black p-2">
                  <p className="text-xs font-bold">{r.userName} ({r.stars}⭐)</p>
                  <p className="text-sm">{r.comment}</p>
                </div>
              ))}
              <button onClick={() => setShowAddRating(t)}
                className="mt-3 w-full bg-yellow-300 font-bold border-2 border-black py-2">
                {(t.ratings || []).find(r => r.userId === user.id) ? '✏️ עדכן דירוג' : '+ דרג את המורה'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MyTeacherForm = ({ current, onSave, onCancel }) => {
  const [name, setName] = useState(current.teacherName || '');
  const [car, setCar] = useState(current.teacherCar || '');
  const [city, setCity] = useState('');
  const [gearType, setGearType] = useState(current.gearType || 'manual');
  const [lessonCost, setLessonCost] = useState(current.teacherLessonCost || '');

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onCancel} className="mb-4 font-bold">← ביטול</button>
      <h1 className="text-3xl font-black mb-6">פרטי המורה שלי 🚗</h1>
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div>
          <label className="block font-bold mb-1">שם המורה</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="שם פרטי ומשפחה" className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">הרכב של המורה</label>
          <input type="text" value={car} onChange={e => setCar(e.target.value)}
            placeholder="למשל: טויוטה קורולה" className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">עיר</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            placeholder="באיזו עיר המורה פעיל" className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div>
          <label className="block font-bold mb-1">💰 מחיר לשיעור (₪) - אופציונלי</label>
          <input type="number" value={lessonCost} onChange={e => setLessonCost(e.target.value)}
            placeholder="למשל: 180"
            className="w-full border-2 border-black p-3 font-bold" />
          <p className="text-xs font-bold text-stone-600 mt-1">✨ השיתוף יעזור לחברים לדעת כמה לצפות לשלם</p>
        </div>
        <div>
          <label className="block font-bold mb-2">סוג הילוכים</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setGearType('manual')}
              className={`p-3 border-4 border-black font-black ${gearType === 'manual' ? 'bg-black text-yellow-300' : 'bg-white'}`}>
              ⚙️ ידני
            </button>
            <button onClick={() => setGearType('automatic')}
              className={`p-3 border-4 border-black font-black ${gearType === 'automatic' ? 'bg-black text-yellow-300' : 'bg-white'}`}>
              🤖 אוטומטי
            </button>
          </div>
        </div>
        <button onClick={() => name.trim() && onSave({ name, car, city, gearType, lessonCost })}
          className="w-full bg-black text-yellow-300 font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          שמור ✓
        </button>
      </div>
    </div>
  );
};

const AddRatingForm = ({ teacher, onSave, onCancel }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onCancel} className="mb-4 font-bold">← ביטול</button>
      <h1 className="text-2xl font-black mb-2">דרג את</h1>
      <h2 className="text-3xl font-black mb-6">{teacher.name}</h2>
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div>
          <label className="block font-bold mb-2 text-center">כמה כוכבים?</label>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setStars(i)}
                className={`w-14 h-14 border-4 border-black flex items-center justify-center ${i <= stars ? 'bg-yellow-300' : 'bg-white'}`}>
                <Star size={28} fill={i <= stars ? '#000' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1">חוות דעת (אופציונלי)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="מה דעתך על המורה?" rows="4"
            className="w-full border-2 border-black p-3 font-medium" />
        </div>
        <button onClick={() => stars > 0 && onSave(teacher, stars, comment)} disabled={stars === 0}
          className="w-full bg-black text-yellow-300 font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] disabled:opacity-50">
          שלח דירוג ✓
        </button>
      </div>
    </div>
  );
};

// ============ FRIENDS SCREEN ============
const FriendsScreen = ({ user, userData, onBack }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // עדכון פרופיל שלי לציבורי
      const progress = calculateProgress(userData);
      const myPublic = {
        id: user.id, name: user.name, city: user.city, joinedAt: user.joinedAt,
        lessonCount: (userData.lessons || []).length, progress,
        theoryPassed: userData.theoryPassed || false,
        licenseIssued: userData.licenseIssued || false,
        achievementsCount: getUnlockedAchievements(userData).length,
        avatar: userData.avatar || null,
      };
      await window.storage.set(`publicuser:${user.id}`, JSON.stringify(myPublic), true);

      const list = await window.storage.list('publicuser:', true);
      const keys = list?.keys || [];
      const users = [];
      for (const key of keys) {
        try {
          const res = await window.storage.get(key, true);
          if (res?.value) users.push(JSON.parse(res.value));
        } catch (e) {}
      }
      setAllUsers(users);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const sorted = [...allUsers].sort((a, b) => b.progress - a.progress);
  const myRank = sorted.findIndex(u => u.id === user.id) + 1;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-2">השוואה עם חברים 👥</h1>
      <p className="font-bold text-stone-600 mb-6">איפה אתה עומד בקהילה</p>

      {myRank > 0 && (
        <div className="bg-yellow-300 border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-sm">המיקום שלך</p>
          <p className="text-4xl font-black">#{myRank}</p>
          <p className="font-bold text-sm">מתוך {sorted.length} נהגים חדשים</p>
        </div>
      )}

      {loading ? <p className="text-center font-bold py-8">טוען...</p> :
       sorted.length === 0 ? (
        <div className="bg-white border-4 border-black p-6 text-center">
          <p className="font-bold">אין עדיין משתמשים בקהילה</p>
          <p className="text-sm mt-2">שתף את האפליקציה עם חברים!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((u, idx) => {
            const isMe = u.id === user.id;
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            return (
              <div key={u.id}
                className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  isMe ? 'bg-yellow-300' : 'bg-white'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-black min-w-[36px] text-center">{rankEmoji}</div>
                  <AvatarDisplay avatar={u.avatar} name={u.name} size="sm" />
                  <div className="flex-1">
                    <p className="font-black text-lg">
                      {u.name} {isMe && '(אני)'}
                    </p>
                    {u.city && <p className="text-xs font-bold text-stone-600">📍 {u.city}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">{u.progress}%</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-stone-200 border-2 border-black overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${u.progress}%` }} />
                </div>
                <div className="flex gap-3 mt-2 text-xs font-bold">
                  <span>📚 {u.lessonCount || 0} שיעורים</span>
                  {u.theoryPassed && <span>✅ תיאוריה</span>}
                  {u.licenseIssued && <span>🏆 רישיון!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ REMINDERS SCREEN ============
const RemindersScreen = ({ userData, updateUserData, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const reminders = userData.reminders || [];

  const addReminder = (r) => {
    const newReminder = { ...r, id: 'rem_' + Date.now(), createdAt: new Date().toISOString() };
    updateUserData({ ...userData, reminders: [...reminders, newReminder] });
    setShowAdd(false);
  };

  const deleteReminder = (id) => {
    updateUserData({ ...userData, reminders: reminders.filter(r => r.id !== id) });
  };

  const now = new Date();
  const upcoming = reminders
    .filter(r => new Date(r.datetime) >= now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const past = reminders
    .filter(r => new Date(r.datetime) < now)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  if (showAdd) return <AddReminderForm onSave={addReminder} onCancel={() => setShowAdd(false)} />;

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-black">תזכורות 🔔</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-black text-yellow-300 p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          <Plus size={24} strokeWidth={4} />
        </button>
      </div>
      <div className="bg-orange-100 border-2 border-black p-3 mb-4 text-xs font-bold">
        💡 התזכורות נשמרות באפליקציה. פתח אותה מדי פעם כדי לראות מה קרוב.
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white border-4 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Bell size={48} className="mx-auto mb-4" />
          <p className="font-black">אין תזכורות עדיין</p>
          <p className="text-sm mt-2">הוסף שיעור מתוכנן או טסט שקבעת</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 className="font-black text-lg mb-2">⏰ קרוב</h2>
              <div className="space-y-2 mb-4">
                {upcoming.map(r => {
                  const d = new Date(r.datetime);
                  const daysUntil = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={r.id} className="bg-lime-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-black">{r.title}</p>
                          <p className="text-xs font-bold">
                            {d.toLocaleDateString('he-IL')} {d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs font-bold mt-1">
                            {daysUntil === 0 ? '🎯 היום!' : daysUntil === 1 ? 'מחר' : `בעוד ${daysUntil} ימים`}
                          </p>
                          {r.notes && <p className="text-sm mt-1">{r.notes}</p>}
                        </div>
                        <button onClick={() => deleteReminder(r.id)}
                          className="bg-white border-2 border-black p-1">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 className="font-black text-lg mb-2 mt-4">📚 היסטוריה</h2>
              <div className="space-y-2">
                {past.map(r => (
                  <div key={r.id} className="bg-stone-200 border-4 border-black p-3 opacity-70">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-black">{r.title}</p>
                        <p className="text-xs font-bold">{new Date(r.datetime).toLocaleDateString('he-IL')}</p>
                      </div>
                      <button onClick={() => deleteReminder(r.id)}
                        className="bg-white border-2 border-black p-1">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const AddReminderForm = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('שיעור נהיגה');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title.trim() || !date) {
      alert('צריך כותרת ותאריך');
      return;
    }
    const datetime = new Date(`${date}T${time}`).toISOString();
    onSave({ title: title.trim(), datetime, notes: notes.trim() });
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onCancel} className="mb-4 font-bold">← ביטול</button>
      <h1 className="text-3xl font-black mb-6">תזכורת חדשה 🔔</h1>
      <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div>
          <label className="block font-bold mb-1">על מה?</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="למשל: שיעור נהיגה, טסט..."
            className="w-full border-2 border-black p-3 font-bold" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold mb-1">תאריך</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold" />
          </div>
          <div>
            <label className="block font-bold mb-1">שעה</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold" />
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1">הערות</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="פרטים נוספים..." rows="2"
            className="w-full border-2 border-black p-3 font-medium" />
        </div>
        <button onClick={handleSave}
          className="w-full bg-black text-yellow-300 font-black text-xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
          שמור תזכורת ✓
        </button>
      </div>
    </div>
  );
};

// ============ FEED SCREEN ============
const FeedScreen = ({ user, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const list = await window.storage.list('feed:', true);
      const keys = list?.keys || [];
      const items = [];
      for (const key of keys) {
        try {
          const res = await window.storage.get(key, true);
          if (res?.value) items.push(JSON.parse(res.value));
        } catch (e) {}
      }
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(items);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadFeed(); }, []);

  const toggleLike = async (post) => {
    try {
      const key = `feed:${post.id}`;
      const res = await window.storage.get(key, true);
      const data = JSON.parse(res.value);
      data.likedBy = data.likedBy || [];
      if (data.likedBy.includes(user.id)) {
        data.likedBy = data.likedBy.filter(id => id !== user.id);
      } else {
        data.likedBy.push(user.id);
      }
      data.likes = data.likedBy.length;
      await window.storage.set(key, JSON.stringify(data), true);
      loadFeed();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-2">פיד חברתי 📢</h1>
      <p className="text-sm font-bold text-stone-600 mb-6">מה קורה אצל הנהגים החדשים</p>

      {loading ? <p className="text-center font-bold py-8">טוען...</p> :
       posts.length === 0 ? (
        <div className="bg-white border-4 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Share2 size={48} className="mx-auto mb-4" />
          <p className="font-black">עדיין אין פוסטים בפיד</p>
          <p className="text-sm mt-2">תעד שיעור חדש וסמן "שתף עם חברים"!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const liked = (post.likedBy || []).includes(user.id);
            return (
              <div key={post.id} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-4 border-b-4 border-black">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center font-black text-xl">
                      {post.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black">{post.userName}</p>
                      <p className="text-xs font-bold text-stone-600">
                        {post.userCity && `${post.userCity} • `}
                        {new Date(post.createdAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                </div>
                {post.photo && (
                  <div className="border-b-4 border-black">
                    <img src={post.photo} alt="lesson" className="w-full" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-lime-300 border-2 border-black px-2 py-1 text-xs font-black">
                      שיעור #{post.lessonNumber}
                    </span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} fill={i <= post.rating ? '#FACC15' : 'none'} stroke="#000" />
                      ))}
                    </div>
                  </div>
                  {post.notes && <p className="font-medium mb-2">{post.notes}</p>}
                  {post.teacherName && <p className="text-sm font-bold">🚗 עם {post.teacherName}</p>}
                </div>
                <div className="border-t-4 border-black p-3 flex items-center gap-4">
                  <button onClick={() => toggleLike(post)}
                    className={`flex items-center gap-1 font-black ${liked ? 'text-red-500' : ''}`}>
                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                    <span>{post.likes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ SETTINGS SCREEN ============
const SettingsScreen = ({ user, userData, onBack, onLogout, onEditAvatar }) => {
  const shareApp = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'MyLicense - אפליקציה לנהגים חדשים',
        text: 'תצטרף אלי לאפליקציה שמלווה אותך בהוצאת הרישיון!',
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('הלינק הועתק! שלח לחברים 📤');
    }
  };

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 font-bold">← חזרה</button>
      <h1 className="text-3xl font-black mb-6">הגדרות ⚙️</h1>
      <div className="bg-white border-4 border-black p-5 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4 mb-3">
          <AvatarDisplay avatar={userData.avatar} name={user.name} size="md" />
          <div>
            <p className="font-black text-xl">{user.name}</p>
            {user.city && <p className="font-bold text-stone-600">{user.city}</p>}
          </div>
        </div>
        <button onClick={onEditAvatar}
          className="w-full bg-yellow-300 border-2 border-black font-bold py-2 flex items-center justify-center gap-2">
          ✏️ שנה תמונת פרופיל
        </button>
      </div>
      <button onClick={shareApp}
        className="w-full bg-cyan-300 font-black text-lg py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3 flex items-center justify-center gap-2">
        <Share2 size={24} /> שתף את האפליקציה
      </button>
      <button onClick={() => { if (confirm('להתנתק?')) onLogout(); }}
        className="w-full bg-red-300 font-black text-lg py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
        <LogOut size={24} /> התנתק
      </button>
      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-stone-600">MyLicense v2.0</p>
        <p className="text-xs text-stone-500 mt-1">נבנה באהבה 💛</p>
      </div>
    </div>
  );
};

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [screen, setScreen] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await window.storage.get('current_user');
        if (userRes?.value) {
          const u = JSON.parse(userRes.value);
          setUser(u);
          try {
            const dataRes = await window.storage.get(`userdata:${u.id}`);
            if (dataRes?.value) setUserData(JSON.parse(dataRes.value));
          } catch (e) {}
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const handleLogin = async (u) => {
    setUser(u);
    try {
      const dataRes = await window.storage.get(`userdata:${u.id}`);
      if (dataRes?.value) setUserData(JSON.parse(dataRes.value));
    } catch (e) { setUserData({}); }
    setScreen('home');
  };

  const updateUserData = async (newData) => {
    setUserData(newData);
    try {
      await window.storage.set(`userdata:${user.id}`, JSON.stringify(newData));
      const publicData = {
        id: user.id, name: user.name, city: user.city, joinedAt: user.joinedAt,
        lessonCount: (newData.lessons || []).length,
        progress: calculateProgress(newData),
        theoryPassed: newData.theoryPassed || false,
        licenseIssued: newData.licenseIssued || false,
        achievementsCount: getUnlockedAchievements(newData).length,
        avatar: newData.avatar || null,
      };
      await window.storage.set(`publicuser:${user.id}`, JSON.stringify(publicData), true);
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    try { await window.storage.delete('current_user'); } catch (e) {}
    setUser(null);
    setUserData({});
    setScreen('home');
  };

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleAvatarSave = async (avatar) => {
    const newData = { ...userData, avatar };
    await updateUserData(newData);
    setAvatarModalOpen(false);
    setScreen('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FCD34D' }}>
        <div className="text-2xl font-black">טוען...</div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const handleNavigate = (s) => {
    if (s === 'avatar') { setAvatarModalOpen(true); return; }
    setScreen(s);
  };

  const screens = {
    home: <HomeScreen user={user} userData={userData} onNavigate={handleNavigate} />,
    journey: <JourneyScreen userData={userData} updateUserData={updateUserData} onBack={() => setScreen('home')} />,
    lessons: <LessonsScreen user={user} userData={userData} updateUserData={updateUserData} onBack={() => setScreen('home')} />,
    achievements: <AchievementsScreen userData={userData} onBack={() => setScreen('home')} />,
    teachers: <TeachersScreen user={user} userData={userData} updateUserData={updateUserData} onBack={() => setScreen('home')} />,
    friends: <FriendsScreen user={user} userData={userData} onBack={() => setScreen('home')} />,
    reminders: <RemindersScreen userData={userData} updateUserData={updateUserData} onBack={() => setScreen('home')} />,
    feed: <FeedScreen user={user} onBack={() => setScreen('home')} />,
    settings: <SettingsScreen user={user} userData={userData} onBack={() => setScreen('home')} onLogout={handleLogout} onEditAvatar={() => setAvatarModalOpen(true)} />,
  };

  return (
    <div dir="rtl" className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)',
      fontFamily: "'Rubik', 'Heebo', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;900&display=swap');
        * { font-family: 'Rubik', sans-serif; }
      `}</style>
      {screens[screen]}
      {avatarModalOpen && (
        <AvatarPickerModal
          currentAvatar={userData.avatar}
          name={user.name}
          onSave={handleAvatarSave}
          onClose={() => setAvatarModalOpen(false)}
        />
      )}
    </div>
  );
}
