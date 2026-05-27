import React, { useState, useRef } from 'react';
import {
  Camera,
  Plus,
  Thermometer,
  Droplets,
  Calendar,
  Tag,
  FileText,
  Leaf,
  X,
  Check,
} from 'lucide-react';
import { FarmLogEntry } from '../types';

type FilterKey = 'all' | 'flowering' | 'fruiting' | 'harvest';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'flowering', label: '개화기' },
  { key: 'fruiting', label: '착과기' },
  { key: 'harvest', label: '수확기' },
];

const STAGE_OPTIONS: { key: FarmLogEntry['cropStage']; label: string }[] = [
  { key: 'seedling', label: '육묘기' },
  { key: 'vegetative', label: '영양생장기' },
  { key: 'flowering', label: '개화기' },
  { key: 'fruiting', label: '착과기' },
  { key: 'harvest', label: '수확기' },
];

const WEATHER_OPTIONS = ['맑음', '구름 많음', '비'];

function weatherIcon(weather: string) {
  if (weather.includes('맑음')) return '☀️';
  if (weather.includes('구름')) return '⛅';
  if (weather.includes('비')) return '🌧️';
  return '🌤️';
}

interface Props {
  entries: FarmLogEntry[];
  onAddEntry: (entry: FarmLogEntry) => void;
}

export default function FarmLog({ entries, onAddEntry }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalNotes, setModalNotes] = useState('');
  const [modalStage, setModalStage] = useState<FarmLogEntry['cropStage']>('harvest');
  const [modalWeather, setModalWeather] = useState('맑음');
  const [modalTemp, setModalTemp] = useState(22);
  const [modalHumidity, setModalHumidity] = useState(65);
  const [modalPreview, setModalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEntries: FarmLogEntry[] =
    activeFilter === 'all'
      ? entries
      : entries.filter((e) => e.cropStage === activeFilter);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setModalPreview(URL.createObjectURL(file));
  }

  function handleSubmit() {
    if (!modalNotes.trim()) return;
    const stageLabel = STAGE_OPTIONS.find(s => s.key === modalStage)?.label ?? '';
    onAddEntry({
      id: `log-${Date.now()}`,
      imageUrl: modalPreview ?? 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
      cropStage: modalStage,
      cropStageText: stageLabel,
      weather: modalWeather,
      temperature: modalTemp,
      humidity: modalHumidity,
      notes: modalNotes.trim(),
      createdAt: new Date().toISOString(),
    });
    setModalNotes('');
    setModalPreview(null);
    setModalStage('harvest');
    setModalWeather('맑음');
    setModalTemp(22);
    setModalHumidity(65);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openModal() {
    setShowModal(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <header className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">영농 일지</h1>
        <button
          onClick={openModal}
          className="p-2 rounded-full hover:bg-green-700 transition-colors"
          aria-label="새 일지 추가"
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Leaf size={48} className="text-green-200" />
            <p className="text-base font-medium">기록이 없습니다</p>
            <p className="text-sm">아직 작성된 영농 일지가 없어요.</p>
            <button
              onClick={openModal}
              className="mt-2 bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              첫 일지 작성하기
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-green-100" />
            <div className="space-y-6">
              {filteredEntries.map((entry) => {
                const dateLabel = new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                  month: 'long', day: 'numeric',
                });
                const timeLabel = new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit', minute: '2-digit', hour12: false,
                });
                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="w-[68px] flex-shrink-0 text-right pt-3">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{dateLabel}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeLabel}</p>
                    </div>
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mt-3.5 z-10" />
                    </div>
                    <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden mb-1">
                      <img
                        src={entry.imageUrl}
                        alt="영농 일지 이미지"
                        className="w-full h-36 object-cover rounded-t-2xl"
                      />
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <Tag size={11} />
                            {entry.cropStageText}
                          </span>
                          {entry.diagnosisId && (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              <FileText size={11} />
                              AI 진단 있음
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {weatherIcon(entry.weather)} {entry.weather}
                          </span>
                          <span className="flex items-center gap-1">
                            <Thermometer size={12} className="text-orange-400" />
                            {entry.temperature}°C
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets size={12} className="text-blue-400" />
                            {entry.humidity}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.notes}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={openModal}
        className="fixed bottom-20 right-5 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all z-20"
        aria-label="새 일지 작성"
      >
        <Camera size={24} />
      </button>

      {/* 새 일지 작성 모달 */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-40 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="px-4 pb-8 pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">새 영농 일지</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 이미지 선택 */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {modalPreview ? (
                  <div className="relative">
                    <img
                      src={modalPreview}
                      alt="선택된 이미지"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => { setModalPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-green-300 hover:text-green-500 transition-colors"
                  >
                    <Camera size={28} />
                    <span className="text-sm">사진 추가 (선택)</span>
                  </button>
                )}
              </div>

              {/* 생육 단계 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">생육 단계</p>
                <div className="flex gap-2 flex-wrap">
                  {STAGE_OPTIONS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setModalStage(s.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        modalStage === s.key
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 날씨 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">날씨</p>
                <div className="flex gap-2">
                  {WEATHER_OPTIONS.map(w => (
                    <button
                      key={w}
                      onClick={() => setModalWeather(w)}
                      className={`flex-1 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        modalWeather === w
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                      }`}
                    >
                      {weatherIcon(w)} {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* 기온 + 습도 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Thermometer size={11} className="text-orange-400" /> 기온 (°C)
                  </label>
                  <input
                    type="number"
                    value={modalTemp}
                    onChange={e => setModalTemp(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Droplets size={11} className="text-blue-400" /> 습도 (%)
                  </label>
                  <input
                    type="number"
                    value={modalHumidity}
                    onChange={e => setModalHumidity(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* 작업 내용 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">작업 내용 <span className="text-red-400">*</span></p>
                <textarea
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="오늘의 농작업 내용을 기록하세요..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!modalNotes.trim()}
                className="w-full bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={16} />
                일지 저장
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
