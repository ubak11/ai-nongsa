export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { diseaseName } = req.body;
  if (!diseaseName || diseaseName === '진단 실패') {
    return res.status(200).json(null);
  }

  const apiKey = process.env.NCPMS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NCPMS_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    // SVC01: 병명으로 목록 검색
    const searchRes = await fetch(
      `https://ncpms.rda.go.kr/npmsAPI/service?apiKey=${apiKey}&serviceCode=SVC01&sickNameKor=${encodeURIComponent(diseaseName)}&startCursor=1&endCursor=5`
    );
    const searchData = await searchRes.json();
    const items = searchData.service?.list ?? [];

    if (items.length === 0) {
      return res.status(200).json(null);
    }

    const { sickKey, cropName, sickNameKor, sickNameEng, thumbImg } = items[0];

    // SVC05: 상세 정보 (증상, 방제법 등)
    const detailRes = await fetch(
      `https://ncpms.rda.go.kr/npmsAPI/service?apiKey=${apiKey}&serviceCode=SVC05&sickKey=${sickKey}`
    );
    const detailData = await detailRes.json();
    const detail = detailData.service ?? {};

    return res.status(200).json({
      sickKey,
      sickNameKor: sickNameKor || detail.sickNameKor || diseaseName,
      sickNameEng: sickNameEng || detail.sickNameEng || '',
      cropName: cropName || detail.cropName || '',
      symptoms: detail.symptoms || '',
      developmentCondition: detail.developmentCondition || '',
      preventionMethod: detail.preventionMethod || '',
      thumbImg: thumbImg || '',
      imageList: detail.imageList ?? [],
    });
  } catch (error) {
    const cause = error?.cause;
    console.error('NCPMS error:', error, 'cause:', cause?.code, cause?.message);
    return res.status(500).json({
      error: '조회 중 오류가 발생했습니다.',
      detail: error?.message,
      cause: cause?.code ?? cause?.message,
    });
  }
}
