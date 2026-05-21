import React, { useState } from 'react';
import { User, MapPin, Calendar, Bell, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { FarmSettings } from '../types';
import { mockFarmSettings } from '../utils/mockData';

export default function Settings() {
  const [form, setForm] = useState<FarmSettings>({ ...mockFarmSettings });
  const [notifMorning, setNotifMorning] = useState(true);
  const [notifPest, setNotifPest] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [toast, setToast] = useState(false);

  function handleSave() {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          설정이 저장되었습니다!
        </div>
      )}

      {/* Header */}
      <div className="bg-green-600 px-4 pt-10 pb-5">
        <h1 className="text-white text-xl font-bold">농장 설정</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <User size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-800">{form.farmerName}</p>
            <p className="text-sm text-gray-500">{form.cropVariety} 재배 중</p>
          </div>
        </div>

        {/* 농장 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">농장 정보</h2>

          {/* 위치 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <MapPin size={12} />
              위치
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* 재배 작물 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">재배 작물</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.cropType === 'strawberry'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => setForm({ ...form, cropType: 'strawberry' })}
              >
                딸기
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  form.cropType === 'tomato'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
                onClick={() => setForm({ ...form, cropType: 'tomato' })}
              >
                토마토
              </button>
            </div>
          </div>

          {/* 품종 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">품종</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.cropVariety}
              onChange={(e) => setForm({ ...form, cropVariety: e.target.value })}
            />
          </div>

          {/* 정식일 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Calendar size={12} />
              정식일
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.plantingDate}
              onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
            />
          </div>

          {/* 하우스 면적 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">하우스 면적</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={form.greenhouseArea}
                onChange={(e) => setForm({ ...form, greenhouseArea: Number(e.target.value) })}
              />
              <span className="text-sm text-gray-500">㎡</span>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            <Bell size={14} className="text-green-500" />
            알림 설정
          </h2>

          {/* Toggle item */}
          {[
            { label: '매일 아침 6시 액션 가이드', value: notifMorning, set: setNotifMorning },
            { label: '병해충 위험 경보', value: notifPest, set: setNotifPest },
            { label: '주간 생육 보고서', value: notifReport, set: setNotifReport },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button
                onClick={() => item.set(!item.value)}
                className="focus:outline-none"
              >
                {item.value ? (
                  <ToggleRight size={28} className="text-green-500" />
                ) : (
                  <ToggleLeft size={28} className="text-gray-300" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 저장하기 */}
        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Save size={18} />
          저장하기
        </button>
      </div>
    </div>
  );
}
