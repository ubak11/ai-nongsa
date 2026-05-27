/**
 * NCPMS 주요 병해충 데이터를 로컬에서 받아 JSON으로 저장하는 스크립트.
 * 로컬(한국 IP)에서만 실행 가능.
 *
 * 실행: node scripts/fetch-ncpms-data.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = '2026535126f0ac2aba425c8321eb38b12984';
const BASE = 'https://ncpms.rda.go.kr/npmsAPI/service';

// AI 진단에서 자주 나오는 병해충 목록
const DISEASES = [
  '흰가루병',
  '잿빛곰팡이병',
  '역병',
  '탄저병',
  '세균성점무늬병',
  '균핵병',
  '시들음병',
  '노균병',
  '점박이응애',
  '진딧물',
  '온실가루이',
  '총채벌레',
  '배꼽썩음병',
  '토마토황화잎말림바이러스',
  '잎곰팡이병',
  '바이러스병',
  '뿌리혹병',
  '풋마름병',
];

// 우선 작물 (설정된 재배 작물 순)
const PREFERRED_CROPS = ['딸기', '토마토', '방울토마토', '파프리카', '오이', '고추'];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchDisease(name) {
  const searchUrl = `${BASE}?apiKey=${API_KEY}&serviceCode=SVC01&sickNameKor=${encodeURIComponent(name)}&startCursor=1&endCursor=10`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const items = searchData.service?.list ?? [];

  if (items.length === 0) return null;

  // 우선 작물 순으로 매칭, 없으면 첫 번째 결과 사용
  const item =
    PREFERRED_CROPS.map(crop => items.find(i => i.cropName === crop)).find(Boolean)
    ?? items[0];

  const { sickKey, cropName, sickNameKor, sickNameEng, thumbImg } = item;

  // SVC05: 상세 정보
  const detailUrl = `${BASE}?apiKey=${API_KEY}&serviceCode=SVC05&sickKey=${sickKey}`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();
  const detail = detailData.service ?? {};

  return {
    sickKey,
    sickNameKor: sickNameKor || detail.sickNameKor || name,
    sickNameEng: sickNameEng || detail.sickNameEng || '',
    cropName: cropName || detail.cropName || '',
    symptoms: detail.symptoms || '',
    developmentCondition: detail.developmentCondition || '',
    preventionMethod: detail.preventionMethod || '',
    thumbImg: thumbImg || '',
    imageList: (detail.imageList ?? []).slice(0, 3),
  };
}

async function main() {
  console.log(`NCPMS 데이터 다운로드 시작 (${DISEASES.length}개 병해충)\n`);
  const result = {};

  for (const disease of DISEASES) {
    process.stdout.write(`  ${disease} ... `);
    try {
      const data = await fetchDisease(disease);
      if (data) {
        result[disease] = data;
        console.log(`✓ (${data.cropName})`);
      } else {
        console.log('결과 없음');
      }
    } catch (e) {
      console.log(`오류: ${e.message}`);
    }
    await sleep(300);
  }

  const outPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'ncpmsData.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n완료! ${Object.keys(result).length}개 저장 → ${outPath}`);
}

main();
