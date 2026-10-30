# 실제 실험 사진

이 폴더에 실제 촬영 사진을 넣습니다. 사진 파일은 아직 포함되어 있지 않습니다.
`index.html`의 각 사진 슬롯에서 빈 `data-photo-src`에 파일 경로를 입력하면 표시됩니다.

| 파일명 | 사진 | 권장 비율 |
| --- | --- | --- |
| rubber-plant.jpg | 고무나무 | 4:3 |
| pothos.jpg | 스킨답서스 | 4:3 |
| peace-lily.jpg | 스파티필름 | 4:3 |
| lambs-ear.jpg | 램스이어 | 4:3 |
| chamber.jpg | DIY 실험 챔버와 잎 배치 | 4:3 |
| dispersion.jpg | 활성탄 분산 과정 | 4:3 |
| settling.jpg | 45분 자연 침강 과정 | 4:3 |
| tape-transfer.jpg | 테이프 전사 과정 | 4:3 |
| opencv-analysis.jpg | Python·OpenCV 분석 화면 | 16:10 |

예: `data-photo-src="assets/photos/rubber-plant.jpg"`.
JPG, PNG, WebP 사용 가능. 확장자를 바꾸면 HTML의 경로도 맞춥니다.
`alt`는 해당 사진의 내용을 설명하도록 수정합니다. 이미지는 잘리지 않고 슬롯에 맞춰 표시됩니다.
빈 경로는 네트워크 요청을 만들지 않으며, 잘못된 경로는 안내 화면으로 돌아갑니다.
