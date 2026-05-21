import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Thermometer,
  Droplets,
  Calendar,
  Tag,
  FileText,
  Leaf,
} from 'lucide-react';
import { FarmLogEntry } from '../types';
import { mockFarmLog } from '../utils/mockData';

type FilterKey = 'all' | 'flowering' | 'fruiting' | 'harvest';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'flowering', label: '개화기' },
  { key: 'fruiting', label: '착과기' },
  { key: 'harvest', label: '수확기' },
];

function weatherIcon(weather: string) {
  if (weather.includes('맑음')) return '☀️';
  if (weather.includes('구름')) return '⛅';
  if (weather.includes('비')) return '🌧️';
  return '🌤️';
}

export default function FarmLog() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filteredEntries: FarmLogEntry[] =
    activeFilter === 'all'
      ? mockFarmLog
      : mockFarmLog.filter((e) => e.cropStage === activeFilter);

  function handleAddEntry() {
    alert('새 영농 일지 작성 기능은 준비 중입니다.');
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">영농 일지</h1>
        <button
          onClick={handleAddEntry}
          className="p-2 rounded-full hover:bg-green-700 transition-colors"
          aria-label="새 일지 추가"
        >
          <Plus size={22} />
        </button>
      </header>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Leaf size={48} className="text-green-200" />
            <p className="text-base font-medium">기록이 없습니다</p>
            <p className="text-sm text-gray-400">아직 작성된 영농 일지가 없어요.</p>
          </div>
        ) : (
          /* Timeline */
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-green-100" />

            <div className="space-y-6">
              {filteredEntries.map((entry) => {
                const dateLabel = new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                });
                const timeLabel = new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });

                return (
                  <div key={entry.id} className="flex gap-4">
                    {/* Date column */}
                    <div className="w-[68px] flex-shrink-0 text-right pt-3">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{dateLabel}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeLabel}</p>
                    </div>

                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow mt-3.5 z-10" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden mb-1">
                      {/* Image */}
                      <img
                        src={entry.imageUrl}
                        alt="영농 일지 이미지"
                        className="w-full h-36 object-cover rounded-t-2xl"
                      />

                      <div className="p-3 space-y-2">
                        {/* Stage + diagnosis badge row */}
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

                        {/* Weather / temp / humidity */}
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

                        {/* Notes */}
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

      {/* FAB */}
      <button
        onClick={handleAddEntry}
        className="fixed bottom-20 right-5 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all z-20"
        aria-label="사진 촬영"
      >
        <Camera size={24} />
      </button>
    </div>
  );
}
