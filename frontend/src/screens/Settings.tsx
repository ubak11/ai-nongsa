import React, { useState } from 'react';
import { User, MapPin, Calendar, Bell, Save, ChevronDown, ChevronUp, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { FarmSettings } from '../types';
import { mockFarmSettings } from '../utils/mockData';
import { PROVINCES, DISTRICTS, CROPS } from '../utils/koreanRegions';

interface Props {
  settings: FarmSettings;
  onSave: (s: FarmSettings) => void;
}

export default function Settings({ settings, onSave }: Props) {
  const [form, setForm] = useState<FarmSettings>({ ...settings });
  const [notifMorning, setNotifMorning] = useState(true);
  const [notifPest, setNotifPest] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [toast, setToast] = useState(false);
  const [showProvince, setShowProvince] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);

  const districts = DISTRICTS[form.province] ?? [];

  function toggleCrop(id: string) {
    setForm(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.includes(id)
        ? prev.cropTypes.filter(c => c !== id)
        : [...prev.cropTypes, id],
    }));
  }

  function selectProvince(p: string) {
    setForm(prev => ({ ...prev, province: p, district: DISTRICTS[p]?.[0] ?? '' }));
    setShowProvince(false);
  }

  function selectDistrict(d: string) {
    setForm(prev => ({ ...prev, district: d }));
    setShowDistrict(false);
  }

  function handleSave() {
    onSave(form);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  const selectedCropLabels = CROPS
    .filter(c => form.cropTypes.includes(c.id))
    .map(c => c.emoji + ' ' + c.label)
    .join(', ') || '미선택';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          설정이 저장되었습니다!
        </div>
      )}

      {/* 드롭다운 오버레이 */}
      {(showProvince || showDistrict) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowProvince(false); setShowDistrict(false); }}
        />
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
            <p className="text-sm text-gray-500">{selectedCropLabels} 재배 중</p>
          </div>
        </div>

        {/* 농장 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-gray-700">농장 정보</h2>

          {/* 농부 이름 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
              <User size={12} /> 농부 이름
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.farmerName}
              onChange={e => setForm({ ...form, farmerName: e.target.value })}
            />
          </div>

          {/* 위치 — 시/도 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
              <MapPin size={12} /> 위치
            </label>
            <div className="flex gap-2">
              {/* 시/도 */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setShowProvince(v => !v); setShowDistrict(false); }}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <span className={form.province ? 'text-gray-800' : 'text-gray-400'}>
                    {form.province || '시/도 선택'}
                  </span>
                  {showProvince ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {showProvince && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {PROVINCES.map(p => (
                      <button
                        key={p}
                        onClick={() => selectProvince(p)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 flex items-center justify-between ${form.province === p ? 'text-green-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {p}
                        {form.province === p && <Check size={14} className="text-green-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 시/군/구 */}
              <div className="relative flex-1">
                <button
                  onClick={() => { setShowDistrict(v => !v); setShowProvince(false); }}
                  disabled={!form.province}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-40"
                >
                  <span className={form.district ? 'text-gray-800' : 'text-gray-400'}>
                    {form.district || '시/군/구'}
                  </span>
                  {showDistrict ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {showDistrict && districts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {districts.map(d => (
                      <button
                        key={d}
                        onClick={() => selectDistrict(d)}
                        className={`w-full text-left px-3 py-2.5 text-sm hover:bg-green-50 flex items-center justify-between ${form.district === d ? 'text-green-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {d}
                        {form.district === d && <Check size={14} className="text-green-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 재배 작물 다중 선택 */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              재배 작물 <span className="text-green-500 font-medium">({form.cropTypes.length}개 선택됨)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map(crop => {
                const selected = form.cropTypes.includes(crop.id);
                return (
                  <button
                    key={crop.id}
                    onClick={() => toggleCrop(crop.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-green-500 border-green-500 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <span>{crop.emoji}</span>
                    <span>{crop.label}</span>
                    {selected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 품종 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">대표 품종</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.cropVariety}
              onChange={e => setForm({ ...form, cropVariety: e.target.value })}
            />
          </div>

          {/* 정식일 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Calendar size={12} /> 정식일
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.plantingDate}
              onChange={e => setForm({ ...form, plantingDate: e.target.value })}
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
                onChange={e => setForm({ ...form, greenhouseArea: Number(e.target.value) })}
              />
              <span className="text-sm text-gray-500">㎡</span>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            <Bell size={14} className="text-green-500" /> 알림 설정
          </h2>
          {[
            { label: '매일 아침 6시 액션 가이드', value: notifMorning, set: setNotifMorning },
            { label: '병해충 위험 경보', value: notifPest, set: setNotifPest },
            { label: '주간 생육 보고서', value: notifReport, set: setNotifReport },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button onClick={() => item.set(!item.value)} className="focus:outline-none">
                {item.value
                  ? <ToggleRight size={28} className="text-green-500" />
                  : <ToggleLeft size={28} className="text-gray-300" />}
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
