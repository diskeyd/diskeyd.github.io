from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import sqlite3
import datetime
import json
import os
from contextlib import asynccontextmanager


# Pydantic 모델들
class ProjectView(BaseModel):
    project_id: int


# 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect("portfolio.db")
    cursor = conn.cursor()

    # 프로젝트 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            tech_stack TEXT,
            github_url TEXT,
            demo_url TEXT,
            project_number INTEGER,
            view_count INTEGER DEFAULT 0,
            like_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 프로젝트 좋아요 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            ip_address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, ip_address)
        )
    """)

    # 프로젝트 조회 기록 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            ip_address TEXT NOT NULL,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 샘플 프로젝트 데이터 삽입 (한 번만)
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        sample_projects = [
            (
                "Web portfolio",
                "웹 프로젝트",
                "JavaScript,FastAPI,CSS,HTML,Docker",
                "https://github.com/diskeyd/diskeyd.github.io",
                "https://diskeyd.github.io",
                1,
            ),
            (
                "Project NO.2",
                "프로젝트 2번",
                "Code1,Code2,Code3",
                "https://github.com/",
                "https://github.com/",
                2,
            ),
            (
                "Project NO.3",
                "프로젝트 3번",
                "Code1,Code2,Code3",
                "https://github.com/",
                "https://github.com/",
                3,
            ),
            (
                "Project NO.4",
                "프로젝트 4번",
                "Code1,Code2,Code3",
                "https://github.com/",
                "https://github.com/",
                4,
            ),
        ]

        cursor.executemany(
            "INSERT INTO projects (title, description, tech_stack, github_url, demo_url, project_number) VALUES (?, ?, ?, ?, ?, ?)",
            sample_projects,
        )

    conn.commit()
    conn.close()


# Lifespan 이벤트
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("포트폴리오 서버 시작")
    yield
    print("서버 종료")


# FastAPI 앱 생성
app = FastAPI(
    title="Diskeyd Portfolio",
    description="포트폴리오 웹사이트",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
if os.path.exists("css"):
    app.mount("/css", StaticFiles(directory="css"), name="css")
if os.path.exists("js"):
    app.mount("/js", StaticFiles(directory="js"), name="js")
if os.path.exists("assets"):
    app.mount("/assets", StaticFiles(directory="assets"), name="assets")


# 메인 페이지
@app.get("/", response_class=HTMLResponse)
async def serve_portfolio():
    """메인 포트폴리오 페이지"""
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(
            content="""
            <div style="font-family: Arial, sans-serif; text-align: center; margin: 100px auto; max-width: 600px;">
                <h1 style="color: #2196F3;">Portfolio Backend 실행 중</h1>
                <p>index.html 파일을 찾을 수 없습니다.</p>
                <div style="margin: 20px;">
                    <a href="/docs" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">📚 API 문서</a>
                    <a href="/api/projects" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">📂 프로젝트 API</a>
                </div>
            </div>
            """
        )


# ===== 프로젝트 API 엔드포인트들 =====


@app.get("/api/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    try:
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, title, description, tech_stack, github_url, demo_url, 
                   project_number, view_count, like_count, created_at
            FROM projects 
            ORDER BY project_number
        """)

        projects = []
        for row in cursor.fetchall():
            tech_stack = row[3].split(",") if row[3] else []
            projects.append(
                {
                    "id": row[0],
                    "title": row[1],
                    "description": row[2],
                    "tech_stack": tech_stack,
                    "github_url": row[4],
                    "demo_url": row[5],
                    "project_number": row[6],
                    "view_count": row[7],
                    "like_count": row[8],
                    "created_at": row[9],
                }
            )

        conn.close()
        return {"success": True, "projects": projects}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프로젝트 조회 오류: {str(e)}")


@app.post("/api/projects/{project_id}/view")
async def increment_project_view(project_id: int, request: Request):
    """프로젝트 조회수 증가"""
    try:
        client_ip = request.client.host
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()

        # 프로젝트 존재 확인
        cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        # 중복 조회 방지 (같은 IP에서 5분 내 중복 조회 방지)
        cursor.execute(
            """
            SELECT COUNT(*) FROM project_views 
            WHERE project_id = ? AND ip_address = ? 
            AND viewed_at > datetime('now', '-5 minutes')
        """,
            (project_id, client_ip),
        )

        recent_views = cursor.fetchone()[0]

        if recent_views == 0:
            # 조회수 증가
            cursor.execute(
                "UPDATE projects SET view_count = view_count + 1 WHERE id = ?",
                (project_id,),
            )

            # 조회 기록 저장
            cursor.execute(
                "INSERT INTO project_views (project_id, ip_address) VALUES (?, ?)",
                (project_id, client_ip),
            )

            incremented = True
        else:
            incremented = False

        # 현재 조회수 반환
        cursor.execute("SELECT view_count FROM projects WHERE id = ?", (project_id,))
        view_count = cursor.fetchone()[0]

        conn.commit()
        conn.close()

        return {
            "success": True,
            "view_count": view_count,
            "incremented": incremented,
            "message": "조회수가 증가했습니다"
            if incremented
            else "최근에 조회하신 프로젝트입니다.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조회수 업데이트 오류: {str(e)}")


@app.post("/api/projects/{project_id}/like")
async def toggle_project_like(project_id: int, request: Request):
    """프로젝트 좋아요 토글"""
    try:
        client_ip = request.client.host
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()

        # 프로젝트 존재 확인
        cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        # 좋아요 기록 확인
        cursor.execute(
            "SELECT id FROM project_likes WHERE project_id = ? AND ip_address = ?",
            (project_id, client_ip),
        )

        existing_like = cursor.fetchone()

        if existing_like:
            # 이미 좋아요 했으면 취소
            cursor.execute(
                "DELETE FROM project_likes WHERE project_id = ? AND ip_address = ?",
                (project_id, client_ip),
            )
            cursor.execute(
                "UPDATE projects SET like_count = like_count - 1 WHERE id = ?",
                (project_id,),
            )
            liked = False
            message = "좋아요를 취소했습니다"
        else:
            # 좋아요 추가
            cursor.execute(
                "INSERT INTO project_likes (project_id, ip_address) VALUES (?, ?)",
                (project_id, client_ip),
            )
            cursor.execute(
                "UPDATE projects SET like_count = like_count + 1 WHERE id = ?",
                (project_id,),
            )
            liked = True
            message = "좋아요를 눌렀습니다"

        # 현재 좋아요 수 조회
        cursor.execute("SELECT like_count FROM projects WHERE id = ?", (project_id,))
        like_count = cursor.fetchone()[0]

        conn.commit()
        conn.close()

        return {
            "success": True,
            "liked": liked,
            "like_count": like_count,
            "message": message,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"좋아요 처리 오류: {str(e)}")


@app.get("/api/projects/stats")
async def get_project_stats():
    """프로젝트 전체 통계"""
    try:
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()

        # 전체 통계
        cursor.execute(
            "SELECT SUM(view_count), SUM(like_count), COUNT(*) FROM projects"
        )
        total_views, total_likes, total_projects = cursor.fetchone()

        # 가장 인기있는 프로젝트
        cursor.execute("""
            SELECT title, view_count, like_count 
            FROM projects 
            ORDER BY (view_count + like_count * 2) DESC 
            LIMIT 1
        """)
        popular_project = cursor.fetchone()

        # 최근 24시간 활동
        cursor.execute("""
            SELECT COUNT(*) FROM project_views 
            WHERE viewed_at > datetime('now', '-24 hours')
        """)
        recent_views = cursor.fetchone()[0]

        # 프로젝트별 통계
        cursor.execute("""
            SELECT title, view_count, like_count 
            FROM projects 
            ORDER BY project_number
        """)

        project_list = []
        for row in cursor.fetchall():
            project_list.append({"title": row[0], "views": row[1], "likes": row[2]})

        conn.close()

        return {
            "total_views": total_views or 0,
            "total_likes": total_likes or 0,
            "total_projects": total_projects or 0,
            "recent_views_24h": recent_views or 0,
            "most_popular": {
                "title": popular_project[0] if popular_project else "없음",
                "views": popular_project[1] if popular_project else 0,
                "likes": popular_project[2] if popular_project else 0,
            }
            if popular_project
            else None,
            "projects": project_list,
            "last_update": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 오류: {str(e)}")


@app.get("/api/projects/{project_id}")
async def get_project_detail(project_id: int):
    """특정 프로젝트 상세 정보"""
    try:
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, title, description, tech_stack, github_url, demo_url, 
                   project_number, view_count, like_count, created_at
            FROM projects 
            WHERE id = ?
        """,
            (project_id,),
        )

        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        tech_stack = result[3].split(",") if result[3] else []

        project = {
            "id": result[0],
            "title": result[1],
            "description": result[2],
            "tech_stack": tech_stack,
            "github_url": result[4],
            "demo_url": result[5],
            "project_number": result[6],
            "view_count": result[7],
            "like_count": result[8],
            "created_at": result[9],
        }

        conn.close()
        return {"success": True, "project": project}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프로젝트 조회 오류: {str(e)}")


# 기본 API
@app.get("/api/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "message": "프로젝트 백엔드 정상 작동 중",
        "features": ["프로젝트 조회", "좋아요 시스템", "조회수 추적", "통계 분석"],
        "endpoints": [
            "GET /api/projects - 프로젝트 목록",
            "POST /api/projects/{id}/view - 조회수 증가",
            "POST /api/projects/{id}/like - 좋아요 토글",
            "GET /api/projects/stats - 전체 통계",
            "GET /api/projects/{id} - 프로젝트 상세",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4000, reload=False)
