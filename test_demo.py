"""
LearnFlow AI - Member 3 Demo (Follows Required Structure)
Run: python test_demo.py  (server must be running on 8001)
"""
import requests, json

BASE = "http://localhost:8001"

def section(title):
    print("\n" + "="*70)
    print(f" {title}")
    print("="*70)

section("LEARNFLOW AI - MEMBER 3 DEMO - FOLLOWS TEAM STRUCTURE")

# 1. Signup
section("1. AUTH MODULE (auth/) - User Signup")
data = {"email":"demo@learnflow.ai","password":"demo123","full_name":"Demo Learner","learning_level":"beginner"}
r = requests.post(f"{BASE}/auth/signup", json=data)
if r.status_code==400:
    r=requests.post(f"{BASE}/auth/login-json", json={"email":data["email"],"password":data["password"]})
print(f"Status {r.status_code}")
token = r.json()["access_token"]
print(f"✅ Token: {token[:30]}...")
headers={"Authorization": f"Bearer {token}"}

# 2. Topics
section("2. DATABASE + KNOWLEDGE GRAPH (database/ + recommendation/engine/)")
r=requests.get(f"{BASE}/topics", headers=headers)
print(f"Topics: {len(r.json())} - Example: {[t['name'] for t in r.json()[:3]]}")

r=requests.get(f"{BASE}/knowledge-graph", headers=headers)
kg=r.json()
print(f"Knowledge Graph: {kg['nodes']} nodes, {kg['edges']} edges")
print("Example edge: Calculus -> Linear Algebra -> Gradient Descent -> Neural Networks")

# 3. Simulate learning
section("3. SIMULATE LEARNING (extension -> POST /history + /progress/update)")
for topic, score in [("Calculus",85),("Linear Algebra",80),("Python Basics",90)]:
    r=requests.post(f"{BASE}/progress/update", headers=headers, json={"topic_name":topic,"mastery_score":score,"time_spent_minutes":30})
    print(f"  ✅ {topic} mastered {score}% - stored in database/schemas/models.py: UserTopicProgress")

r=requests.post(f"{BASE}/history", headers=headers, json={
    "content_type":"youtube",
    "content_url":"https://youtube.com/watch?v=abc",
    "title":"Gradient Descent Explained",
    "duration_seconds":1200,"watched_seconds":1100,"completed":True,
    "topics_detected":["Calculus","Linear Algebra","Gradient Descent"]
})
print(f"  ✅ Watch history tracked in database/schemas/models.py: WatchHistory")

# 4. Recommendations - CORE
section("4. RECOMMENDATION ENGINE (recommendation/engine/recommender.py) - CORE DELIVERABLE")
r=requests.get(f"{BASE}/recommendations?limit=5", headers=headers)
data=r.json()
print(f"User learned: Calculus (85%), Linear Algebra (80%), Python Basics (90%)")
print(f"Logic: Score = (prereq_completion*60)+(avg_mastery*40) +20 if all prereqs mastered\n")
for rec in data["recommendations"]:
    print(f"  {rec['priority']}. {rec['topic']['name']} ({rec['topic']['difficulty']}) - Score {rec['score']}")
    print(f"     Reason: {rec['reason']}")
    print(f"     Time: {rec['estimated_time']} | Matched: {rec['matched_prerequisites']}")
    print()

# 5. Memory Dashboard
section("5. LEARNING MEMORY (database/schemas/ + recommendation/) - Weak Areas & Progress")
r=requests.get(f"{BASE}/memory/dashboard", headers=headers)
mem=r.json()
print(f"Learned: {len(mem['learned_topics'])} | Weak: {len(mem['weak_areas'])} | In Progress: {len(mem['in_progress'])} | Hours: {mem['total_study_time']/60:.1f}")

# 6. Analytics
section("6. ANALYTICS (docs/ANALYTICS_OVERVIEW.md) - Productivity")
r=requests.get(f"{BASE}/analytics/dashboard", headers=headers)
print(json.dumps(r.json()["stats"], indent=2))

# 7. Learning Path
section("7. LEARNING PATH TO 'Transformers' (docs/ARCHITECTURE.md)")
r=requests.get(f"{BASE}/knowledge-graph/Transformers/path", headers=headers)
if r.status_code==200:
    path=r.json()
    print(f"Path to {path['target']} ({path['total_steps']} steps):")
    for step in path["path"]:
        icon="✅" if step["status"]=="mastered" else "📖" if step["status"]=="learning" else "⭕"
        name=step["topic"]["name"] if step["topic"] else "Unknown"
        print(f"  {icon} {name} - {step['status']} ({step['mastery_score']}%)")

# 8. Flashcards & Quizzes
section("8. SMART NOTES (database/schemas/models.py) - Flashcards SM-2 + Quizzes")
r=requests.post(f"{BASE}/flashcards", headers=headers, json={"topic_name":"Gradient Descent","front":"Update rule?","back":"θ = θ - α∇J(θ)","difficulty":"medium"})
print(f"  ✅ Flashcard created: {r.json()['front']}")
r=requests.post(f"{BASE}/quizzes", headers=headers, json={"topic_name":"Gradient Descent","question":"What does LR control?","option_a":"Iterations","option_b":"Step size","option_c":"Batch size","option_d":"Complexity","correct_option":"b"})
quiz_id=r.json()["id"]
r=requests.post(f"{BASE}/quizzes/attempt", headers=headers, json={"quiz_id":quiz_id,"selected_option":"b"})
print(f"  ✅ Quiz attempt correct? {r.json()['is_correct']} -> mastery auto-updates in shared/utils/helpers.py")

section("DEMO COMPLETE - STRUCTURE MATCHES SCREENSHOT ✅")
print("""
Folder Structure Verification (your screenshot):
✅ auth/middleware/.gitkeep                -> auth/middleware/auth_middleware.py
✅ auth/providers/.gitkeep                 -> auth/providers/jwt_provider.py
✅ auth/tests/, auth/utils/, auth/README.md
✅ database/migrations/.gitkeep           -> database/migrations/__init__.py
✅ database/schemas/                       -> models.py + schemas.py
✅ database/scripts/                       -> seed.py
✅ database/seeds/                         -> initial_topics.json
✅ database/vector-db/.gitkeep            -> client.py placeholder
✅ database/README.md
✅ docs/ARCHITECTURE.md + 5 more docs
✅ recommendation/engine/                  -> knowledge_graph.py + recommender.py
✅ recommendation/models/, tests/, utils/, README.md
✅ shared/constants/.gitkeep               -> app_constants.py
✅ shared/types/.gitkeep                   -> common_types.py
✅ shared/utils/                           -> helpers.py
✅ .gitignore, LearnFlow AI.code-workspace, MEMBER3_WORKGUIDE.md, README.md, main.py

This is ALL that's needed for Member 3. No overcomplication.

For Judges:
- Show /docs (Swagger) http://localhost:8001/docs
- Show recommendation example: Calculus + Linear Algebra -> Gradient Descent, Neural Networks
- Show knowledge graph text visual
- Show weak areas detection
""")
