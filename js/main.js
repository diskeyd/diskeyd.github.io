// ===== API 설정 =====
// FastAPI 백엔드 서버 주소 (수업에서 배운 API 통신)
const API_BASE_URL = "http://localhost:4000";

// ===== API 호출 함수들 =====
// 비동기 처리를 위해 async/await 사용 (수업에서 배운 기법)
async function fetchProjects() {
  try {
    // Fetch API로 데이터 요청
    const response = await fetch(`${API_BASE_URL}/api/projects`);
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("프로젝트 로드 실패:", error);
    return [];
  }
}

async function incrementView(projectId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/view`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("조회수 증가 실패:", error);
    return null;
  }
}

async function toggleLike(projectId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/like`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    return null;
  }
}

async function getProjectStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("통계 로드 실패:", error);
    return null;
  }
}

// ===== 프로젝트 슬라이더 기능 =====
let currentSlideIndex = 0;
let projectsData = [];

function slideProjects(direction) {
  const slider = document.querySelector(".project-slider");
  const cards = document.querySelectorAll(".project-card");
  const maxIndex = cards.length - 1;

  currentSlideIndex += direction;

  if (currentSlideIndex < 0) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex > maxIndex) {
    currentSlideIndex = maxIndex;
  }

  const slideWidth = 344;
  const translateX = currentSlideIndex * slideWidth;
  slider.scrollTo({
    left: translateX,
    behavior: "smooth",
  });

  updateArrowButtons();
}

function updateArrowButtons() {
  const prevBtn = document.querySelector(".nav-arrow.prev");
  const nextBtn = document.querySelector(".nav-arrow.next");
  const cards = document.querySelectorAll(".project-card");
  const maxIndex = cards.length - 1;

  if (!prevBtn || !nextBtn) return;

  if (currentSlideIndex <= 0) {
    prevBtn.style.opacity = "0.3";
    prevBtn.style.cursor = "not-allowed";
  } else {
    prevBtn.style.opacity = "1";
    prevBtn.style.cursor = "pointer";
  }

  if (currentSlideIndex >= maxIndex) {
    nextBtn.style.opacity = "0.3";
    nextBtn.style.cursor = "not-allowed";
  } else {
    nextBtn.style.opacity = "1";
    nextBtn.style.cursor = "pointer";
  }
}

// 동적 프로젝트 카드 생성 (원래 디자인 + 새로운 색상 팩레트)
function renderProjectCards(projects) {
  const slider = document.querySelector(".project-slider");
  if (!slider) return;

  projectsData = projects;
  slider.innerHTML = "";

  const projectStyles = {
    1: {
      className: "synto",
      gradient: "linear-gradient(135deg, #9281CD 0%, #8C9ED9 100%)", // 보라색 계열
      visual: '<div class="synto-character">🚀</div>',
    },
    2: {
      className: "rrate",
      gradient: "linear-gradient(135deg, #68C7C1 0%, #566A8E 100%)", // 청록-파랑 계열
      visual: `
        <div class="rrate-ui">
          <div>프로젝트 포인트</div>
        </div>
      `,
    },
    3: {
      className: "defai",
      gradient: "linear-gradient(135deg, #D8634F 0%, #CC9473 100%)", // 주황-갈색 계열
      visual: `
        <div class="defai-ui">
          <div>프로젝트 포인트</div>
        </div>
      `,
    },
    4: {
      className: "portfolio",
      gradient: "linear-gradient(135deg, #DCEAA2 0%, #E2E7E4 100%)", // 연한 초록-회색 계열
      visual: `
        <div class="portfolio-ui">
          <div>프로젝트 포인트</div>
        </div>
      `,
    },
  };

  projects.forEach((project, index) => {
    const projectNum = project.project_number || index + 1;
    const style = projectStyles[projectNum] || projectStyles[1];

    const card = document.createElement("div");
    card.className = `project-card modern-card ${style.className}`;
    card.setAttribute("data-project-id", project.id);

    // 새로운 색상 적용
    card.style.background = style.gradient;

    card.innerHTML = `
      <!-- 프로젝트 태그 -->
      <div class="project-tag">PROJECT NO.${projectNum}</div>
      
      <!-- 프로젝트 제목 -->
      <h3 class="project-title">${project.title}</h3>
      
      <!-- 기술 스택 (제목 바로 밑으로 이동) -->
      <div class="tech-stack-top">
        ${project.tech_stack
          .slice(0, 3)
          .map(
            (tech) => `
          <span class="tech-tag">${tech}</span>
        `
          )
          .join("")}
      </div>
      
      <!-- 프로젝트 시각적 요소 -->
      <div class="project-visual">
        ${style.visual}
      </div>
      
      <!-- GitHub/Demo 링크 (호버시 표시) -->
      <div class="project-links">
        ${
          project.github_url
            ? `
          <a href="${project.github_url}" target="_blank" class="project-link">
            <i class="fab fa-github"></i>
          </a>
        `
            : ""
        }
        ${
          project.demo_url
            ? `
          <a href="${project.demo_url}" target="_blank" class="project-link">
            <i class="fas fa-external-link-alt"></i>
          </a>
        `
            : ""
        }
      </div>
      
      <!-- 조회수/좋아요 (제일 밑으로 이동) -->
      <div class="stats-bottom">
        <div class="stat-group">
          <i class="fas fa-eye"></i>
          <span class="view-count">${project.view_count}</span>
        </div>
        <div class="stat-group like-btn" data-project-id="${project.id}">
          <i class="fas fa-heart"></i>
          <span class="like-count">${project.like_count}</span>
        </div>
      </div>
    `;

    slider.appendChild(card);

    // 호버 효과: 링크 버튼 표시
    card.addEventListener("mouseenter", () => {
      const links = card.querySelector(".project-links");
      if (links) links.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      const links = card.querySelector(".project-links");
      if (links) links.style.opacity = "0";
    });

    // 카드 클릭 시 조회수 증가
    card.addEventListener("click", async (e) => {
      if (!e.target.closest("a") && !e.target.closest(".like-btn")) {
        const result = await incrementView(project.id);
        if (result && result.incremented) {
          updateViewCount(project.id, result.view_count);
          showModernMessage("프로젝트 조회됨! 🚀");
        }
      }
    });
  });

  // 좋아요 버튼 이벤트 리스너 추가
  addLikeButtonListeners();

  // 화살표 버튼 상태 업데이트
  updateArrowButtons();
}

// 좋아요 버튼 이벤트 리스너 (새로운 구조에 맞게 수정)
function addLikeButtonListeners() {
  const likeButtons = document.querySelectorAll(".stat-group.like-btn");

  likeButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation(); // 카드 클릭 이벤트 방지

      const projectId = parseInt(button.getAttribute("data-project-id"));
      const result = await toggleLike(projectId);

      if (result) {
        updateLikeButton(button, result.liked, result.like_count);
        showModernMessage(result.message);
      }
    });
  });
}

// 조회수 업데이트
function updateViewCount(projectId, newCount) {
  const card = document.querySelector(`[data-project-id="${projectId}"]`);
  if (card) {
    const viewCountElement = card.querySelector(".view-count");
    if (viewCountElement) {
      viewCountElement.textContent = newCount;
    }
  }
}

// 좋아요 버튼 업데이트 (새로운 구조에 맞게 수정)
function updateLikeButton(button, liked, likeCount) {
  const heartIcon = button.querySelector("i");
  const countElement = button.querySelector(".like-count");

  if (liked) {
    heartIcon.style.color = "#D8634F";
    button.style.animation = "heartBeat 0.5s ease";
  } else {
    heartIcon.style.color = "rgba(255, 255, 255, 0.9)";
    button.style.animation = "";
  }

  countElement.textContent = likeCount;

  setTimeout(() => {
    button.style.animation = "";
  }, 500);
}

// 현대적인 메시지 표시
function showModernMessage(message) {
  const existingMessage = document.querySelector(".modern-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "modern-message";
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #68C7C1 0%, #9281CD 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 20px;
    z-index: 1000;
    font-size: 0.9rem;
    font-weight: 500;
    animation: modernSlideIn 0.3s ease;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "modernSlideOut 0.3s ease";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 300);
  }, 2500);
}

// 프로젝트 통계 표시
async function displayProjectStats() {
  const stats = await getProjectStats();
  if (!stats) return;

  updateStatsInFunSection(stats);
  console.log("📊 프로젝트 통계:", stats);
}

// Fun 섹션 통계 업데이트
function updateStatsInFunSection(stats) {
  const statNumbers = document.querySelectorAll(".stat-number");

  statNumbers.forEach((element) => {
    const target = element.getAttribute("data-target");

    if (target === "8") {
      element.setAttribute("data-target", stats.total_projects);
      element.textContent = stats.total_projects;
    } else if (target === "150") {
      element.setAttribute("data-target", stats.total_views);
      element.textContent = stats.total_views;

      const label = element.nextElementSibling;
      if (label && label.classList.contains("stat-label")) {
        label.textContent = "조회수";
      }
    }
  });
}

// 슬라이더 초기화
async function initProjectSlider() {
  const projects = await fetchProjects();

  if (projects.length > 0) {
    renderProjectCards(projects);
  } else {
    console.log("프로젝트 데이터를 로드할 수 없습니다.");
  }

  const slider = document.querySelector(".project-slider");
  if (slider) {
    slider.addEventListener("scroll", function () {
      const slideWidth = 344;
      const scrollLeft = slider.scrollLeft;
      currentSlideIndex = Math.round(scrollLeft / slideWidth);
      updateArrowButtons();
    });
  }
}

// CSS 애니메이션 추가
function addProjectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes heartBeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .loading-message {
      text-align: center;
      color: #ccc;
      padding: 50px;
      font-size: 1.1em;
    }
    
    .like-btn:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #e74c3c !important;
    }
  `;

  document.head.appendChild(style);
}

// ===== 기본 네비게이션 및 이벤트 =====

function updateURL(sectionName) {
  if (sectionName) {
    window.location.hash = sectionName;
  } else {
    window.location.hash = "";
  }
}

function getCurrentSection() {
  return window.location.hash.replace("#", "") || null;
}

function restorePageState() {
  const currentSection = getCurrentSection();
  if (currentSection) {
    showSection(currentSection);
  } else {
    goHome();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎨 Portfolio 로드됨");

  addProjectStyles();
  initNavigation();
  initContactForm();
  initProjectSlider();
  animateStats();
  initAdvancedEffects();
  displayProjectStats();
  restorePageState();

  window.addEventListener("hashchange", restorePageState);
});

function initAdvancedEffects() {
  const navButtons = document.querySelectorAll(".nav-button");

  navButtons.forEach(function (button) {
    button.addEventListener("touchstart", function (e) {
      this.style.transform = "translateY(-2px) scale(0.98)";
    });

    button.addEventListener("touchend", function (e) {
      setTimeout(() => {
        this.style.transform = "";
      }, 100);
    });
  });

  setTimeout(function () {
    document.querySelector(".container").style.opacity = "1";
  }, 100);
}

function initNavigation() {
  const navButtons = document.querySelectorAll(".nav-button");

  navButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      createRipple(e, this);
      const targetSection = this.getAttribute("data-section");
      setTimeout(function () {
        showSection(targetSection);
      }, 100);
    });
  });
}

function createRipple(event, element) {
  const button = element;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = diameter + "px";
  circle.style.left = event.clientX - rect.left - radius + "px";
  circle.style.top = event.clientY - rect.top - radius + "px";
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);

  setTimeout(function () {
    if (circle.parentNode) {
      circle.remove();
    }
  }, 600);
}

function showSection(sectionName) {
  const mainContainer = document.querySelector(".container");
  const targetSection = document.getElementById(sectionName);
  const allSections = document.querySelectorAll(".content-section");

  mainContainer.style.display = "none";

  allSections.forEach(function (section) {
    section.classList.remove("active");
  });

  if (targetSection) {
    targetSection.classList.add("active");
    updateURL(sectionName);
  }
}

function goHome() {
  const mainContainer = document.querySelector(".container");
  const allSections = document.querySelectorAll(".content-section");

  allSections.forEach(function (section) {
    section.classList.remove("active");
  });

  mainContainer.style.display = "flex";
  updateURL();
}

function animateStats() {
  const statNumbers = document.querySelectorAll(".stat-number");

  statNumbers.forEach(function (stat) {
    const target = parseInt(stat.getAttribute("data-target"));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(function () {
      current += step;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      stat.textContent = Math.floor(current);
    }, 16);
  });
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const message = formData.get("message").trim();

    if (!name) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!email || !isValidEmail(email)) {
      alert("올바른 이메일을 입력해주세요.");
      return;
    }

    if (!message) {
      alert("메시지를 입력해주세요.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "전송 중...";
    submitBtn.disabled = true;

    setTimeout(function () {
      alert("메시지가 전송되었습니다! 감사합니다.");
      form.reset();

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    goHome();
  }
});

window.addEventListener("load", function () {
  console.log(
    "%c✨ Portfolio",
    "color: #68C7C1; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%c📚 HTML5 · CSS3 · JavaScript + FastAPI",
    "color: #9281CD; font-size: 12px;"
  );

  const loadTime = performance.now();
  console.log(`⚡ 로딩 시간: ${Math.round(loadTime)}ms`);

  fetch(`${API_BASE_URL}/api/health`)
    .then((response) => response.json())
    .then((data) => {
      console.log("🚀 백엔드 연결 성공:", data.message);
    })
    .catch((error) => {
      console.warn("⚠️ 백엔드 연결 실패:", error);
    });
});

window.addEventListener("error", function (e) {
  console.error("❌ 오류 발생:", e.message);
});

function getCurrentTime() {
  return new Date().toLocaleTimeString("ko-KR");
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 전역 함수
window.goHome = goHome;
window.showSection = showSection;
window.slideProjects = slideProjects;
