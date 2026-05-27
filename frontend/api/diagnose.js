export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType, cropTypes = [] } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  const cropInfo = cropTypes.length > 0
    ? `재배 작물: ${cropTypes.join(', ')}`
    : '';

  const prompt = `당신은 농촌진흥청 NCPMS(국가농작물병해충관리시스템) 공인 병해충 진단 전문가입니다.
${cropInfo}

[진단 방법]
1. 사진에서 실제로 보이는 이상 증상을 먼저 관찰하세요:
   - 색상 변화(황화, 갈변, 백화 등), 병반 형태(점무늬, 분말, 균총, 수침상 등), 해충 개체, 분포 패턴
2. 관찰된 증상을 NCPMS 기준과 대조하세요:
   • 잎/과실 흰색 분말 → 흰가루병 (Powdery mildew)
   • 회갈색 병반 + 회색 포자층 → 잿빛곰팡이병 (Botrytis cinerea)
   • 줄기 기부 암갈색 + 급격한 시들음 → 역병 (Phytophthora)
   • 과실 갈색 함몰 + 분홍 포자 → 탄저병 (Colletotrichum)
   • 잎에 갈색 수침상 반점 → 세균성점무늬병 (Pseudomonas)
   • 흰 솜털 균총 + 검은 균핵 → 균핵병 (Sclerotinia)
   • 하위 잎부터 황화 + 관다발 갈변 → 시들음병 (Fusarium)
   • 잎 뒷면 회자색 균층 → 노균병 (Downy mildew)
   • 잎 황화 + 상향 말림 → 토마토황화잎말림바이러스 (TYLCV)
   • 잎 뒷면 군집 소형 곤충 + 감로 → 진딧물 (Aphid)
   • 잎 표면 황색 점박이 + 거미줄 → 점박이응애 (Tetranychus urticae)
   • 잎 뒷면 흰 성충 → 온실가루이 (Bemisia tabaci)
   • 은색 줄무늬 탈색 → 총채벌레 (Thrips)
   • 과실 끝 갈변 함몰 → 칼슘결핍(배꼽썩음병)
   • 증상 없음 → 건강한 상태
3. 진단 결과를 아래 JSON 형식으로만 출력하세요.

출력 형식(반드시 이 JSON만 출력, 다른 텍스트 절대 없음):
{"diseaseName":"한국어병명(학명)","confidence":숫자0-100,"severity":"low또는medium또는high","description":"관찰된병징2문장","treatment":"방제방법","pesticide":"농약명또는해당없음","concentration":"희석배수또는-"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: {
            temperature: 0.05,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini 응답이 비어 있습니다: ' + JSON.stringify(data));

    // JSON 추출 (마크다운 코드블록 포함 대응)
    const jsonMatch = text.replace(/```json\n?|\n?```/g, '').match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON을 찾을 수 없습니다: ' + text.substring(0, 200));

    const raw = JSON.parse(jsonMatch[0]);

    const validSeverity = ['low', 'medium', 'high'];
    const diagnosis = {
      diseaseName: raw.diseaseName || '진단 결과 없음',
      confidence: Math.min(100, Math.max(0, Number(raw.confidence) || 50)),
      severity: validSeverity.includes(raw.severity) ? raw.severity : 'low',
      description: raw.description || '사진에서 병징을 확인하기 어렵습니다.',
      treatment: raw.treatment || '정밀 진단을 위해 가까운 농업기술센터에 문의하세요.',
      pesticide: raw.pesticide || '해당 없음',
      concentration: raw.concentration || '-',
    };

    return res.status(200).json({
      id: `diag-${Date.now()}`,
      imageUrl: '',
      createdAt: new Date().toISOString(),
      ...diagnosis,
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return res.status(500).json({ error: '진단 중 오류가 발생했습니다.', detail: error.message });
  }
}
