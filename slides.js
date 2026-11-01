/* 내용 데이터: 좌표는 1440 × 810 기준. HWP 보고서를 우선합니다. */
(() => {
let serial=0;
const text=(text,x,y,w,h,size=32,extra={})=>({id:'n'+(++serial),type:'text',text,x,y,w,h,size,color:'#173f2c',bold:false,align:'left',...extra});
const image=(src,alt,x,y,w,h,extra={})=>({id:'n'+(++serial),type:'image',src,alt,x,y,w,h,fit:'cover',positionX:50,positionY:50,radius:0,...extra});
const diagram=(kind,x,y,w,h)=>({id:'n'+(++serial),type:'diagram',kind,x,y,w,h});
const common=(section,title,sub='')=>[text(section,76,52,1200,30,18,{color:'#44824e',bold:true,tracking:2}),text(title,76,106,1290,155,53,{bold:true}),...(sub?[text(sub,78,224,1260,58,24,{color:'#5f7263'})]:[])];
const slide=(name,theme,nodes,note='',bg='#f6f4ea')=>({id:'s'+(++serial),name,theme,bg,nodes,note});
const photo=(key,label,x,y,w,h)=>image('assets/'+key+'-stomata.jpg',label+' 실제 기공 관찰 사진',x,y,w,h,{radius:140});
const areaRows=[{name:'고무나무',values:[.802,.103]},{name:'스킨답서스',values:[.666,.134]},{name:'스파티필름',values:[1.234,.068]},{name:'램스이어',values:[1.138,.106]}];
const chart=(kind,rows,x,y,w,h,extra={})=>({id:'n'+(++serial),type:'chart',kind,rows,x,y,w,h,colors:['#248850','#bfd39a'],labels:['앞면','뒷면'],unit:'cm²',...extra});
window.DEFAULT_DECK={schemaVersion:1,title:'잎 표면 구조에 따른 미세먼지 흡착률 비교',authors:'유민수, 정은우',slides:[
slide('표지','cover',[
 text('SCIENCE EXPLORATION  /  생명과학 탐구',76,62,850,30,19,{bold:true,tracking:1.8}),
 text('잎 표면 구조에 따른',76,188,760,80,49,{bold:true}),
 text('미세먼지\n흡착률 비교',70,279,810,230,94,{bold:true,lineHeight:1.14}),
 text('네 가지 식물, 두 개의 표면.\n잎 위에 남은 입자에서 답을 찾다.',79,556,720,82,27,{color:'#526d55',lineHeight:1.55}),
 text('광주중학교  ·  유민수, 정은우',79,718,720,34,24,{bold:true}),
 image('assets/leaf-illustration.png','기존 PDF의 잎 구조 설명용 일러스트',833,197,552,426,{fit:'contain'}),
 text('LEAF SURFACE\n& PARTICLE ADHESION',997,654,355,64,20,{tracking:2,bold:true}),
 text('기존 발표자료의 설명용 일러스트',967,733,380,27,15,{color:'#62795b'})
], '표지는 기존 PDF의 잎 일러스트를 활용했습니다. 실제 식물 전체 사진은 첨부자료에 없습니다.','#f5f0e4'),
slide('목차','contents',[
 ...common('CONTENTS  /  탐구의 흐름','작은 질문에서,\n관찰 가능한 답으로.'),
 text('우리가 따라간 다섯 단계',78,410,550,45,27,{color:'#61775c'}),
 ...['탐구 동기와 목적','이론적 배경','탐구 대상 및 실험 방법','실험 결과','결론 및 아쉬운 점'].flatMap((v,i)=>[text('0'+(i+1),741,160+i*108,80,50,32,{color:'#56a044',bold:true}),text(v,846,165+i*108,510,48,31,{bold:true})]),
 text('15 SLIDES  ·  4 PLANTS  ·  1 QUESTION',78,705,670,29,18,{tracking:1.5})
]),
slide('탐구 동기','motivation',[
 ...common('01  /  WHY LEAVES?','미세먼지를 줄이는 방법,\n잎에서 찾을 수 있을까?'),
 text('도시화 · 산업화',80,362,490,48,33,{bold:true}),text('늘어나는 미세먼지와 실내 공기 오염',80,426,620,60,28,{color:'#62735d'}),
 text('화학적 처리 없이,\n친환경적인 방법을 찾아서.',80,572,760,100,37,{bold:true}),
 photo('rubber','고무나무',936,190,370,370),
 text('잎 표면의 미세구조에 주목',877,584,510,48,29,{bold:true}),text('구조가 다르면\n입자를 붙잡는 능력도 다를까?',877,650,510,85,28,{color:'#61775c'})
]),
slide('탐구 목적','purpose',[
 ...common('02  /  RESEARCH QUESTION','잎의 구조와 부착 능력의 관계를 알아보자'),
 ...[
 ['01','구조를 구분하고','트리콤 · 왁스층 · 일반 평면형'],['02','부착 능력을 비교하고','네 식물의 앞면과 뒷면'],['03','기공을 관찰하고','기공의 형태와 특징'],['04','활용 가능성을 찾아보기','실내공기정화 식물 선정의 기초 자료']
 ].flatMap(([n,a,b],i)=>[text(n,90+(i%2)*685,290+Math.floor(i/2)*215,80,65,49,{color:'#58a245',bold:true}),text(a,195+(i%2)*685,303+Math.floor(i/2)*215,540,50,34,{bold:true}),text(b,195+(i%2)*685,369+Math.floor(i/2)*215,540,65,25,{color:'#61775c'})]),
 text('관찰 → 측정 → 비교',79,727,1100,30,20,{tracking:1.8,bold:true})
]),
slide('이론적 배경','theory',[
 ...common('03  /  THE SCIENCE','입자가 머무는 자리, 세 가지 표면'),
 ...['trichome','wax','flat'].flatMap((kind,i)=>[diagram(kind,90+i*455,260,360,160),text(['트리콤 구조','왁스층 구조','평면형 구조'][i],90+i*455,451,400,48,32,{bold:true}),text(['미세한 털과 돌기 사이에\n입자가 걸리거나 머무를 가능성','왁스 성분의 표면 특성이\n입자 부착에 영향을 줄 가능성','털과 돌기가 상대적으로 적어\n표면 접촉으로 입자가 부착'][i],90+i*455,518,400,110,26,{color:'#5f7263'})]),
 text('테이프 전사법',90,683,270,34,25,{bold:true}),text('붙은 입자를 옮기기',322,686,310,34,23),text('Python + OpenCV',757,683,310,34,25,{bold:true}),text('입자 영역을 면적으로 환산',1061,686,320,34,22)
], '표면 도식은 개념 설명용입니다. 실제 현미경 사진이 아닙니다.'),
slide('탐구 대상','specimens',[
 ...common('04  /  FOUR PLANTS','네 가지 식물, 서로 다른 잎','첨부 보고서에 수록된 실제 기공 관찰 사진으로 만나는 탐구 대상'),
 ...[['rubber','고무나무','원형에 가까운 기공'],['pothos','스킨답서스','기공 사진 관찰 · 형태 서술 없음'],['peace','스파티필름','일반 평면형 · 작아 보이는 기공'],['lamb','램스이어','트리콤 발달 · 길쭉한 기공']].flatMap(([key,name,desc],i)=>[photo(key,name,86+i*344,330,245,245),text('0'+(i+1),87+i*344,610,60,35,19,{color:'#5b9450',bold:true}),text(name,87+i*344,651,310,46,31,{bold:true}),text(desc,87+i*344,713,316,50,19,{color:'#5f7263'})])
], '전체 식물 사진은 원자료에 없습니다. 고무나무·스킨답서스의 구조 분류를 원문에 없는 정보로 단정하지 않았습니다.'),
slide('DIY 챔버','chamber',[
 ...common('05  /  EXPERIMENT SETUP','잎 위에 입자가 내려앉는 작은 실험실'),
 diagram('chamber',94,256,675,470),
 text('상부 트레이',886,280,460,45,33,{bold:true}),text('활성탄 가루를 올려 공기로 분산',886,341,470,62,25,{color:'#61775c'}),
 text('하부 잎 거치대',886,454,460,45,33,{bold:true}),text('측정할 잎을 수평으로 고정',886,515,470,62,25,{color:'#61775c'}),
 text('DIY 챔버',886,627,460,45,33,{bold:true}),text('내부 청결 · 온도와 습도를 일정하게',886,688,490,62,25,{color:'#61775c'}),
 text('실험 장치 설명용 도식',106,738,650,28,18,{color:'#677f63'})
]),
slide('노출 과정','process',[
 ...common('06  /  EXPOSURE','같은 조건에서, 약 50분','활성탄 가루를 모사 미세먼지로 사용했습니다.'),
 text('0.5',92,324,400,175,116,{bold:true}),text('g',333,388,100,70,45,{bold:true}),text('활성탄 가루',93,499,400,50,28),
 text('1',581,324,300,175,116,{bold:true}),text('분',677,388,100,70,45,{bold:true}),text('공기를 주입해 분산',583,499,430,50,28),
 text('50',1040,324,390,175,116,{bold:true}),text('분',1250,388,100,70,45,{bold:true}),text('약 50분간 자연 침적',1041,499,360,50,28),
 text('① 챔버 청결·온습도 유지   →   ② 잎 수평 고정   →   ③ 활성탄 투입   →   ④ 공기 주입   →   ⑤ 침적',88,654,1280,85,25,{bold:true})
], 'PDF에는 45분으로 기재되어 있으나 HWP 보고서의 약 50분을 우선했습니다.'),
slide('테이프 전사','transfer',[
 ...common('07  /  TAPE TRANSFER','같은 잎도, 앞면과 뒷면을 나누어','테이프로 활성탄 입자를 채취한 뒤 흰 종이 위로 옮깁니다.'),
 diagram('front',100,324,530,240),diagram('back',811,324,530,240),
 text('앞면',100,603,500,52,38,{bold:true}),text('1.5 × 2 cm  =  3 cm²',100,674,560,57,38,{color:'#347c41',bold:true}),
 text('뒷면',811,603,500,52,38,{bold:true}),text('1 × 2 cm  =  2 cm²',811,674,560,57,38,{color:'#347c41',bold:true})
], 'HWP 방법 절의 흰 종이 전사를 기준으로 구성했습니다. 앞·뒷면 측정 영역이 달라 부착률은 각 영역으로 나눕니다.'),
slide('입자 면적 분석','analysis',[
 ...common('08  /  IMAGE ANALYSIS','작은 입자를, 비교할 수 있는 숫자로','Python과 OpenCV로 입자 영역을 분석하고 기준 스케일로 실제 면적을 구합니다.'),
 diagram('particles',90,330,355,250),diagram('segmented',540,330,355,250),
 text('cm²',1074,377,290,120,89,{bold:true}),
 text('01  이미지 촬영',90,617,370,48,28,{bold:true}),text('02  입자 영역 분석',540,617,370,48,28,{bold:true}),text('03  실제 면적 환산',1000,617,370,48,28,{bold:true}),
 text('분석 흐름 설명용 도식 · 실제 분석 결과 이미지 아님',90,714,1200,33,20,{color:'#6b7d65'})
]),
slide('부착 면적','results-area',[
 ...common('09  /  RESULTS','식물별 모사 미세먼지 부착 면적','앞면과 뒷면에서 테이프로 전사된 활성탄의 면적을 비교했습니다.'),
 chart('grouped',areaRows,85,310,1265,381),
 text('앞면 측정 영역 3 cm²  /  뒷면 측정 영역 2 cm² · 이 그래프는 부착률이 아닌 부착 면적입니다.',88,731,1280,40,21,{color:'#62765c'})
], 'HWP 탐구 결과 표의 수치입니다. 고무나무 0.802/0.103, 스킨답서스 0.666/0.134, 스파티필름 1.234/0.068, 램스이어 1.138/0.106 cm².'),
slide('앞면 부착률','results-rate',[
 ...common('10  /  THE KEY FINDING','가장 높은 앞면 부착률은, 스파티필름'),
 chart('rank',[{name:'스파티필름',values:[41.1]},{name:'램스이어',values:[37.9]},{name:'고무나무',values:[26.7]},{name:'스킨답서스',values:[22.2]}],86,281,871,405,{colors:['#268a4c','#bbd88b'],labels:['앞면 부착률'],unit:'%'}),
 text('41.1',1031,322,350,145,96,{bold:true,binding:'max-value'}),text('%',1260,439,130,70,50,{bold:true}),text('스파티필름',1034,558,320,48,35,{bold:true,binding:'max-name'}),text('이 실험에서 가장 높은 값',1035,626,320,60,23,{color:'#516948'}),
 text('앞면 부착률 = 전사된 입자 면적 ÷ 앞면 측정 영역(3 cm²) × 100',88,732,1200,36,23,{color:'#62765c'})
], '원자료의 반올림된 앞면 부착률을 그대로 사용했습니다. 공기 중 미세먼지 제거율을 뜻하지 않습니다.'),
slide('기공 관찰','stomata',[
 ...common('11  /  THROUGH THE MICROSCOPE','기공의 모양에도 차이가 있을까?'),
 ...[['rubber','고무나무','비교적 원형에 가까움'],['peace','스파티필름','상대적으로 작아 보임'],['lamb','램스이어','길쭉한 모양'],['pothos','스킨답서스','사진 관찰 · 원문 형태 서술 없음']].flatMap(([key,name,desc],i)=>[photo(key,name,83+i*346,285,266,266),text(name,83+i*346,581,305,45,30,{bold:true}),text(desc,83+i*346,645,316,60,20,{color:'#62765c'})]),
 text('관찰 사진만으로 미세먼지 흡착의 원인을 확정할 수는 없습니다.',83,735,1290,35,24,{bold:true})
], '사진은 HWP에 수록된 순서(고무나무, 스파티필름, 램스이어, 스킨답서스)를 따릅니다. 배율·스케일 정보가 없어 절대 크기를 비교하지 않습니다.'),
slide('결론과 한계','conclusion',[
 ...common('12  /  CONCLUSION','예상과 달랐기에, 더 궁금해진 결과'),
 text('우리가 확인한 것',88,280,610,55,34,{bold:true}),
 text('스파티필름의 앞면 부착률이 가장 높았다.\n트리콤 구조가 가장 높을 것이라는 예상과 달랐다.\n네 식물 모두 앞면의 부착률이 더 높았다.',88,369,625,230,28,{lineHeight:1.9}),
 text('다음 탐구에서 보완할 것',806,280,570,55,34,{bold:true}),
 text('램스이어의 트리콤 사이에 입자가 남아\n테이프 전사가 충분하지 않았을 가능성.\n반복 실험과 전사·측정 방법 개선이 필요하다.',806,369,560,230,28,{lineHeight:1.9}),
 text('전사된 입자의 면적이 실제 포집량과 반드시 같지는 않습니다.',88,687,1285,59,32,{bold:true,color:'#3e7b35'})
]),
slide('마무리','closing',[
 text('LEAF SURFACE  /  SCIENCE EXPLORATION',78,60,1050,34,19,{bold:true,tracking:2}),
 text('작은 잎에서 시작한\n우리의 탐구.',77,204,940,200,76,{bold:true,lineHeight:1.25}),
 text('이 실험에서는 스파티필름의 앞면 부착률이 가장 높았습니다.\n더 정확한 비교를 위해 반복 실험과 측정 방법 개선이 필요합니다.',82,466,1210,105,28,{lineHeight:1.7}),
 text('궁금한 점이 있나요?',82,644,900,60,40,{bold:true}),text('감사합니다.  유민수 · 정은우',82,734,900,40,24),
 image('assets/leaf-illustration.png','기존 PDF 잎 구조 일러스트',1002,129,363,282,{fit:'contain'})
], '질의응답: 실제 제거율과 전사 면적의 차이, 앞·뒷면의 측정 영역 차이, 반복 실험의 필요성을 설명합니다.','#f5f0e4')
]};
})();
