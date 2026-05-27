import React from 'react';
import { BarChart2, Calendar, Leaf, TrendingUp, AlertTriangle } from 'lucide-react';
import { FarmSettings, FarmLogEntry } from '../types';

const STAGES = [
  { label: '육묘기', pct: 0, maxDays: 30 },
  { label: '영양생장기', pct: 20, maxDays: 60 },
  { label: '개화기', pct: 50, maxDays: 100 },
  { label: '착과기', pct: 75, maxDays: 150 },
  { label: '수확기', pct: 100, maxDays: Infinity },
];

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getDaysSincePlanting(plantingDate: string): number {
  const diff = new Date().getTime() - new Date(plantingDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getExpectedHarvestDate(plantingDate: string): string {
  const d = new Date(plantingDate);
  d.setDate(d.getDate() + 180);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getStageInfo(days: number) {
  for (const s of STAGES) {
    if (days <= s.maxDays) return s;
  }
  return STAGES[STAGES.length - 1];
}

function getAiComment(stageLabel: string): string {
  switch (stageLabel) {
    case '육묘기':
      return '육묘 초기 단계입니다. 뿌리 활착에 집중하고 토양 수분을 일정하게 유지하세요. 병해충 발생 여부를 매일 점검하세요.';
    case '영양생장기':
      return '잎과 줄기가 왕성하게 자라는 시기입니다. EC 1.2~1.5 dS/m 관리와 충분한 일조량 확보에 집중하세요.';
    case '개화기':
      return '개화기입니다. 습도 관리에 주의하고 잿빛곰팡이 예방이 필요합니다. 착과기 전환까지 지속적인 수분 관리를 해주세요.';
    case '착과기':
      return '착과기입니다. 기형과 방지를 위해 온도(18~25°C)와 수분 균형 유지가 중요합니다. EC를 1.5~2.0으로 높여주세요.';
    case '수확기':
      return '수확기입니다. 수확 2일 전 관수를 줄여 당도를 높이세요. 잿빛곰팡이 예방 약제 살포 일정을 빠짐없이 유지하세요.';
    default:
      return '생육 상태를 지속적으로 모니터링하세요.';
  }
}

function getWeeklyBarData(logs: FarmLogEntry[]): number[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const counts = Array(7).fill(0);
  logs.forEach((entry) => {
    const diff = Math.floor(
      (new Date(entry.createdAt).getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff >= 0 && diff < 7) counts[diff]++;
  });
  return counts;
}

interface Props {
  settings: FarmSettings;
  logEntries: FarmLogEntry[];
}

export default function Report({ settings, logEntries }: Props) {
  const days = getDaysSincePlanting(settings.plantingDate);
  const expectedHarvest = getExpectedHarvestDate(settings.plantingDate);
  const stageInfo = getStageInfo(days);
  const weeklyData = getWeeklyBarData(logEntries);
  const maxCount = Math.max(...weeklyData, 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-green-600 px-4 pt-10 pb-5">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-white" size={22} />
          <h1 className="text-white text-xl font-bold">성장 보고서</h1>
          <Calendar className="text-white ml-auto" size={20} />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <Leaf size={14} className="text-green-500" />
              <span className="text-xs text-gray-500">재배 일수</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{days}일</p>
            <p className="text-xs text-gray-400 mt-0.5">정식일 기준</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-gray-500">예상 수확일</span>
            </div>
            <p className="text-sm font-bold text-green-700 leading-tight">{expectedHarvest}</p>
            <p className="text-xs text-gray-400 mt-0.5">정식 후 180일</p>
          </div>
        </div>

        {/* 생육 단계 progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">생육 단계</h2>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${stageInfo.pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STAGES.map((s) => (
              <div key={s.label} className="flex flex-col items-center" style={{ width: '20%' }}>
                <span
                  className={`text-[10px] text-center leading-tight ${
                    s.label === stageInfo.label ? 'text-green-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              현재: {stageInfo.label}
            </span>
          </div>
        </div>

        {/* 주간 기록 차트 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">주간 기록 차트</h2>
          <div className="flex items-end justify-between gap-1 h-24">
            {weeklyData.map((count, i) => {
              const heightPct = (count / maxCount) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div
                    className="w-full bg-green-400 rounded-t"
                    style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            {DAY_LABELS.map((label) => (
              <span key={label} className="text-[11px] text-gray-400 flex-1 text-center">
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            이번 주 총 {weeklyData.reduce((a, b) => a + b, 0)}건 기록
          </p>
        </div>

        {/* AI 주간 코멘트 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-700">AI 생육 코멘트</h2>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {stageInfo.label} · {days}일차
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {getAiComment(stageInfo.label)}
          </p>
        </div>

        {/* 농장 정보 요약 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">농장 정보</h2>
          <div className="space-y-2">
            {[
              { label: '농부', value: settings.farmerName },
              { label: '위치', value: `${settings.province} ${settings.district}` },
              { label: '품종', value: settings.cropVariety },
              { label: '면적', value: `${settings.greenhouseArea.toLocaleString()}㎡` },
              { label: '정식일', value: new Date(settings.plantingDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
