#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime, timedelta

# Generate 10 NEW blog posts with diverse Colemearchy themes
new_blog_topics = [
    {
        "prompt": "생성형 AI로 부업 월 1000만원 벌기. ChatGPT, Claude, Midjourney를 활용한 실전 수익화 전략. 콘텐츠 제작, 자동화, SaaS까지",
        "keywords": ["AI 부업", "ChatGPT 수익화", "Claude 활용법", "Midjourney", "패시브 인컴", "자동화"]
    },
    {
        "prompt": "개발자의 번아웃 극복기. 3개월 휴직 후 찾은 진짜 내 삶. 일과 삶의 균형, 의미 있는 커리어 재정의",
        "keywords": ["번아웃", "개발자 휴직", "워라밸", "커리어 전환", "정신건강", "삶의 의미"]
    },
    {
        "prompt": "노마드 개발자 3년차의 리얼 비용 공개. 발리부터 리스본까지, 월 생활비와 세금 최적화 전략",
        "keywords": ["노마드", "디지털 노마드", "해외 거주", "생활비", "세금 최적화", "리모트 워크"]
    },
    {
        "prompt": "개발자가 만든 AI 자동화 홈오피스. 음성 비서부터 스마트 조명까지, 집중력 200% 올리는 환경 구축기",
        "keywords": ["스마트홈", "홈오피스", "자동화", "IoT", "생산성", "재택근무 환경"]
    },
    {
        "prompt": "FAANG 퇴사 후 1인 기업가의 첫해 수익 공개. 실패한 프로젝트와 성공한 SaaS, 그리고 배운 교훈들",
        "keywords": ["FAANG 퇴사", "1인 기업", "SaaS", "스타트업", "창업", "수익 공개"]
    },
    {
        "prompt": "AI 시대의 투자 포트폴리오 재구성. 테크 주식, AI ETF, 암호화폐 비중과 리밸런싱 전략",
        "keywords": ["AI 투자", "포트폴리오", "테크 주식", "ETF", "암호화폐", "자산 배분"]
    },
    {
        "prompt": "개발자를 위한 미니멀 라이프. 불필요한 것 버리고 본질에 집중하기. 디지털 디톡스부터 물건 정리까지",
        "keywords": ["미니멀리즘", "디지털 디톡스", "정리", "집중력", "본질", "단순한 삶"]
    },
    {
        "prompt": "뇌과학으로 해킹하는 개발자 학습법. 도파민 시스템 이해하고 활용하기. 습관 형성부터 장기 기억까지",
        "keywords": ["뇌과학", "학습법", "도파민", "습관", "기억력", "개발 공부"]
    },
    {
        "prompt": "개발자의 부동산 투자 실전기. REITs부터 직접 투자까지, 안정적 패시브 인컴 구축 전략",
        "keywords": ["부동산 투자", "REITs", "패시브 인컴", "개발자 재테크", "자산 형성", "임대 수익"]
    },
    {
        "prompt": "AI와 함께하는 개인 브랜딩. LinkedIn, Twitter, 개인 블로그로 영향력 있는 개발자 되기",
        "keywords": ["개인 브랜딩", "LinkedIn", "Twitter", "개발자 블로그", "영향력", "네트워킹"]
    }
]

def generate_blog_post(topic, index):
    try:
        print(f"\n[{index + 1}/{len(new_blog_topics)}] Generating post...")
        print(f"Topic: {topic['prompt'][:50]}...")
        
        # Calculate publish date (schedule posts 2 hours apart starting from next hour)
        now = datetime.now()
        publish_date = now + timedelta(hours=(index + 1) * 2)
        
        # Try production URL first
        urls = [
            'https://colemearchy.com/api/generate-content',
            'http://localhost:3000/api/generate-content',
            'http://localhost:3001/api/generate-content'
        ]
        
        data = None
        for url in urls:
            try:
                response = requests.post(url, 
                    json={
                        "prompt": f"colemearchy 스타일로 {topic['prompt']}에 대한 깊이 있는 블로그 포스트 작성. 개인적 경험과 실전 노하우를 담아서",
                        "keywords": topic['keywords'],
                        "publishDate": publish_date.isoformat()
                    },
                    timeout=120
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Using endpoint: {url}")
                    break
                else:
                    print(f"❌ {url} returned {response.status_code}")
            except Exception as e:
                print(f"❌ {url} failed: {str(e)}")
                continue
        
        if data and data.get('id'):
            print(f"✅ Success: {data.get('title', 'Untitled')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   Scheduled for: {publish_date.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   URL: https://colemearchy.com/posts/{data.get('slug', '')}")
            return {"success": True, **data}
        
        error_msg = data.get('error', 'Generation failed') if data else 'All endpoints failed'
        print(f"❌ Failed to generate post: {error_msg}")
        return {"success": False, "error": error_msg}
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    print('📝 Generating 10 NEW Colemearchy-style blog posts...')
    print('📅 Posts will be scheduled to publish every 2 hours starting from next hour')
    
    results = {
        "successful": [],
        "failed": []
    }
    
    for i, topic in enumerate(new_blog_topics):
        result = generate_blog_post(topic, i)
        
        if result.get("success"):
            results["successful"].append(result)
        else:
            results["failed"].append({**topic, "error": result.get("error", "Unknown error")})
        
        # Wait between posts to avoid rate limiting
        if i < len(new_blog_topics) - 1:
            print('⏳ Waiting 5 seconds...')
            time.sleep(5)
    
    print(f'\n📊 Generation Complete!')
    print(f'✅ Successful: {len(results["successful"])}')
    print(f'❌ Failed: {len(results["failed"])}')
    
    if results["successful"]:
        print('\nSuccessfully created posts:')
        for s in results["successful"]:
            print(f'- {s.get("title", "Untitled")}')
            if s.get("scheduledAt"):
                scheduled_time = datetime.fromisoformat(s["scheduledAt"].replace('Z', '+00:00'))
                print(f'  Scheduled: {scheduled_time.strftime("%Y-%m-%d %H:%M:%S")}')
    
    if results["failed"]:
        print('\nFailed posts:')
        for f in results["failed"]:
            print(f'- {f["prompt"][:50]}...')
            print(f'  Error: {f["error"]}')

if __name__ == "__main__":
    main()