#!/usr/bin/env python3
import requests
import time
import json

def generate_blog_post(topic, keywords):
    """Generate a single blog post"""
    try:
        # Generate content
        gen_response = requests.post('http://localhost:3001/api/generate-content', 
            json={
                'prompt': f'colemearchy 스타일로 {topic}에 대한 깊이 있는 블로그 포스트 작성',
                'keywords': keywords,
                'type': 'blog-post'
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if gen_response.status_code != 200:
            print(f"Failed to generate content: {gen_response.status_code}")
            return False
            
        generated = gen_response.json()
        
        if 'title' not in generated:
            print("Failed to generate content - no title")
            return False
        
        # Create post
        post_response = requests.post('http://localhost:3001/api/posts',
            json={
                **generated,
                'status': 'PUBLISHED',
                'originalLanguage': 'ko'
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if post_response.status_code != 200:
            print(f"Failed to create post: {post_response.status_code}")
            return False
            
        result = post_response.json()
        
        if 'id' in result:
            print(f"✅ Success: {generated['title']}")
            print(f"   URL: http://localhost:3001/ko/posts/{result.get('slug', '')}")
            return True
        else:
            print(f"Failed to create post: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Generate 10 blog posts"""
    topics = [
        {
            "prompt": "AI 시대에도 살아남는 개발자가 되는 법. 10년차 개발자가 말하는 AI와 공존하며 성장하는 전략",
            "keywords": ["AI 시대", "개발자 생존", "ChatGPT", "Claude", "개발자 차별화"]
        },
        {
            "prompt": "ADHD 개발자의 극한 집중력 해킹법. 산만함을 슈퍼파워로 바꾼 개인적 경험과 과학적 근거",
            "keywords": ["ADHD", "프로그래밍", "집중력", "생산성", "포모도로"]
        },
        {
            "prompt": "개발자를 위한 FIRE 운동 실전 가이드. 연봉 1억 개발자가 경제적 자유를 달성한 투자 전략",
            "keywords": ["FIRE", "개발자 투자", "경제적 자유", "주식", "부동산"]
        },
        {
            "prompt": "개발자 생산성 200% 올리는 바이오해킹 전략. 수면 최적화부터 콜드 샤워까지",
            "keywords": ["바이오해킹", "개발자 생산성", "수면 최적화", "간헐적 단식"]
        },
        {
            "prompt": "스타트업 CTO가 되기까지의 여정과 리더십 철학. 실패한 3개의 스타트업에서 배운 교훈",
            "keywords": ["스타트업 CTO", "리더십", "기술 조직", "팀 빌딩"]
        },
        {
            "prompt": "ChatGPT vs Claude vs Gemini 개발자를 위한 실전 비교. 6개월 사용 후기",
            "keywords": ["ChatGPT", "Claude", "Gemini", "AI 도구", "개발 생산성"]
        },
        {
            "prompt": "코딩으로 망가진 목과 허리 되살리기. 거북목과 허리 디스크에서 탈출한 3개월 재활기",
            "keywords": ["거북목", "허리 디스크", "개발자 건강", "스탠딩 데스크"]
        },
        {
            "prompt": "위고비에서 케토까지, 개발자의 체중 감량 실험기. 3개월간 15kg 감량 스토리",
            "keywords": ["위고비", "케토", "체중 감량", "개발자 다이어트"]
        },
        {
            "prompt": "리모트 워크 3년, 낭만과 현실 사이. 디지털 노마드의 꿈과 실제",
            "keywords": ["리모트 워크", "재택근무", "디지털 노마드", "워라밸"]
        },
        {
            "prompt": "부트캠프 vs CS 학위, 10년차 개발자가 말하는 진실. 채용 담당자의 속마음",
            "keywords": ["부트캠프", "CS 학위", "개발자 교육", "채용"]
        }
    ]
    
    print('📝 Generating 10 blog posts...\n')
    
    success_count = 0
    
    for i, topic in enumerate(topics):
        print(f'\n[{i + 1}/{len(topics)}] Generating post...')
        print(f'Topic: {topic["prompt"][:50]}...')
        
        success = generate_blog_post(topic["prompt"], topic["keywords"])
        if success:
            success_count += 1
        
        if i < len(topics) - 1:
            print('⏳ Waiting 5 seconds...')
            time.sleep(5)
    
    print(f'\n📊 Generation Complete!')
    print(f'✅ Successful: {success_count}')
    print(f'❌ Failed: {len(topics) - success_count}')

if __name__ == '__main__':
    main()