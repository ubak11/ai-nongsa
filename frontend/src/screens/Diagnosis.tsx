import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  History,
  ChevronLeft,
} from 'lucide-react';
import { DiagnosisResult, NcpmsData } from '../types';
import { mockDiagnosisResults } from '../utils/mockData';
import ncpmsRaw from '../utils/ncpmsData.json';

const ncpmsData = ncpmsRaw as Record<string, NcpmsData>;

function lookupNcpms(diseaseName: string): NcpmsData | null {
  if (ncpmsData[diseaseName]) return ncpmsData[diseaseName];
  const keys = Object.keys(ncpmsData);
  for (const key of keys) {
    if (diseaseName.includes(key) || key.includes(diseaseName)) return ncpmsData[key];
  }
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

const severityLabel: Record<DiagnosisResult['severity'], string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

const severityColors: Record<DiagnosisResult['severity'], string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 80
      ? 'bg-green-100 text-green-700'
      : value >= 60
      ? 'bg-orange-100 text-orange-700'
      : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}% 신뢰도
    </span>
  );
}

interface Props {
  onSaveToLog: (entry: import('../types').FarmLogEntry) => void;
}

export default function Diagnosis({ onSaveToLog }: Props) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [ncpmsResult, setNcpmsResult] = useState<NcpmsData | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageSelect(file: File) {
    setSelectedImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setNcpmsResult(null);
    setIsAnalyzing(true);

    try {
      const { base64, mimeType } = await compressImage(file);
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '진단 요청 실패');
      }

      const diagnosis = await res.json();
      setResult({ ...diagnosis, imageUrl: objectUrl });
      setNcpmsResult(lookupNcpms(diagnosis.diseaseName));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류';
      setResult({
        id: 'error',
        imageUrl: objectUrl,
        diseaseName: '진단 실패',
        confidence: 0,
        severity: 'low',
        description: `진단 중 오류가 발생했습니다: ${msg}`,
        treatment: '잠시 후 다시 시도해주세요.',
        pesticide: '해당 없음',
        concentration: '-',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }

  function handleReset() {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setNcpmsResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSaveToLog() {
    if (!result) return;
    onSaveToLog({
      id: `log-${Date.now()}`,
      imageUrl: previewUrl ?? result.imageUrl,
      cropStage: 'flowering',
      cropStageText: '개화기',
      weather: '맑음',
      temperature: 24,
      humidity: 72,
      notes: `AI 진단 실시 — ${result.diseaseName} (신뢰도 ${result.confidence}%). ${result.treatment}`,
      createdAt: new Date().toISOString(),
      diagnosisId: result.id,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {savedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          영농 일지에 저장되었습니다 ✓
        </div>
      )}
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          className="p-1 rounded-full hover:bg-green-700 transition-colors"
          onClick={handleReset}
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">AI 병해충 진단</h1>
      </header>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Upload zone — shown when no image selected and not analyzing and no result */}
        {!selectedImage && !isAnalyzing && !result && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div
              className="border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center justify-center py-12 px-4 gap-4 cursor-pointer hover:bg-green-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={52} className="text-green-400" />
              <p className="text-gray-500 text-sm text-center">
                사진을 촬영하거나 업로드하세요
              </p>
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.capture = 'environment';
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <Camera size={16} />
                  카메라
                </button>
                <button
                  className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload size={16} />
                  갤러리
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && (
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="분석 중인 이미지"
                className="w-32 h-32 object-cover rounded-xl"
              />
            )}
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <p className="text-green-700 font-medium text-sm">AI 분석 중... (최대 3초)</p>
          </div>
        )}

        {/* Result card */}
        {result && !isAnalyzing && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Image + title row */}
            <div className="flex items-start gap-4 p-4 border-b border-gray-100">
              <img
                src={previewUrl ?? result.imageUrl}
                alt={result.diseaseName}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-base font-bold text-gray-900 leading-snug mb-2">
                  {result.diseaseName}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <ConfidenceBadge value={result.confidence} />
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${severityColors[result.severity]}`}
                  >
                    심각도: {severityLabel[result.severity]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>

              {/* Treatment */}
              <div className="border-l-4 border-green-500 pl-3">
                <p className="text-xs font-semibold text-green-700 mb-1">방제 방법</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.treatment}</p>
              </div>

              {/* Pesticide */}
              {result.pesticide !== '해당 없음' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={14} className="text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-700">농약 추천</p>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{result.pesticide}</p>
                  <p className="text-xs text-gray-600 mt-0.5">희석 농도: {result.concentration}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSaveToLog}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  영농 일지에 저장
                </button>
                <button
                  onClick={handleReset}
                  className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors"
                >
                  다시 진단하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NCPMS 공식 정보 카드 */}
        {result && !isAnalyzing && result.id !== 'error' && ncpmsResult && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-blue-50">
              <span className="text-base">🏛️</span>
              <h3 className="text-sm font-bold text-blue-800">NCPMS 공식 정보</h3>
              <span className="ml-auto text-xs text-blue-500 font-medium">농촌진흥청</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-base font-bold text-gray-900">{ncpmsResult.sickNameKor}</p>
                {ncpmsResult.sickNameEng && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">{ncpmsResult.sickNameEng}</p>
                )}
                {ncpmsResult.cropName && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    {ncpmsResult.cropName}
                  </span>
                )}
              </div>

              {ncpmsResult.developmentCondition && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">발생 조건</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stripHtml(ncpmsResult.developmentCondition).slice(0, 200)}
                    {ncpmsResult.developmentCondition.length > 200 && '…'}
                  </p>
                </div>
              )}

              {ncpmsResult.symptoms && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">증상</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stripHtml(ncpmsResult.symptoms).slice(0, 200)}
                    {ncpmsResult.symptoms.length > 200 && '…'}
                  </p>
                </div>
              )}

              {ncpmsResult.preventionMethod && (
                <div className="border-l-4 border-blue-400 pl-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">공식 방제법</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stripHtml(ncpmsResult.preventionMethod).slice(0, 300)}
                    {ncpmsResult.preventionMethod.length > 300 && '…'}
                  </p>
                </div>
              )}

              {ncpmsResult.imageList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">참고 사진</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {ncpmsResult.imageList.slice(0, 4).map((img, i) => (
                      <div key={i} className="flex-shrink-0">
                        <img
                          src={img.image}
                          alt={img.imageTitle}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <p className="text-xs text-gray-400 mt-0.5 w-20 truncate">{img.imageTitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past diagnoses */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-900 text-sm">이전 진단 기록</h2>
          </div>

          <div className="space-y-3">
            {mockDiagnosisResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.diseaseName}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.diseaseName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ConfidenceBadge value={item.confidence} />
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[item.severity]}`}
                    >
                      {severityLabel[item.severity]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
