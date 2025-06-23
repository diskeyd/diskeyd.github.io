// ===== 프로젝트 슬라이더 기능 =====
let currentSlideIndex = 0;
const slideWidth = 344; // 카드 너비(320px) + 갭(24px)

function slideProjects(direction) {
  const slider = document.querySelector('.project-slider');
  const cards = document.querySelectorAll('.project-card');
  const maxIndex = cards.length - 1;
  
  // 인덱스 업데이트
  currentSlideIndex += direction;
  
  // 경계 처리
  if (currentSlideIndex < 0) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex > maxIndex) {
    currentSlideIndex = maxIndex;
  }
  
  // 슬라이드 이동
  const translateX = currentSlideIndex * slideWidth;
  slider.scrollTo({
    left: translateX,
    behavior: 'smooth'
  });
  
  // 화살표 버튼 상태 업데이트
  updateArrowButtons();
}

function updateArrowButtons() {
  const prevBtn = document.querySelector('.nav-arrow.prev');
  const nextBtn = document.querySelector('.nav-arrow.next');
  const cards = document.querySelectorAll('.project-card');
  const maxIndex = cards.length - 1;
  
  // 이전 버튼 상태
  if (currentSlideIndex <= 0) {
    prevBtn.style.opacity = '0.3';
    prevBtn.style.cursor = 'not-allowed';
  } else {
    prevBtn.style.opacity = '1';
    prevBtn.style.cursor = 'pointer';
  }
  
  // 다음 버튼 상태
  if (currentSlideIndex >= maxIndex) {
    nextBtn.style.opacity = '0.3';
    nextBtn.style.cursor = 'not-allowed';
  } else {
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }
}

// 슬라이더 초기화
function initProjectSlider() {
  // 초기 화살표 상태 설정
  updateArrowButtons();
  
  // 슬라이더 스크롤 이벤트 리스너
  const slider = document.querySelector('.project-slider');
  if (slider) {
    slider.addEventListener('scroll', function() {
      // 스크롤 위치에 따라 현재 인덱스 업데이트
      const scrollLeft = slider.scrollLeft;
      currentSlideIndex = Math.round(scrollLeft / slideWidth);
      updateArrowButtons();
    });
  }
}

// ===== URL 기반 네비게이션 =====
function updateURL(sectionName) {
  if (sectionName) {
    window.location.hash = sectionName;
  } else {
    window.location.hash = '';
  }
}

function getCurrentSection() {
  return window.location.hash.replace('#', '') || null;
}

function restorePageState() {
  const currentSection = getCurrentSection();
  if (currentSection) {
    showSection(currentSection);
  } else {
    goHome();
  }
}

// ===== DOM 로드 완료 후 실행 =====
document.addEventListener("DOMContentLoaded", function () {
  console.log("🎨 Clean Portfolio 로드됨");

  // 기능 초기화
  initNavigation();
  initContactForm();
  initProjectSlider();
  animateStats();
  initAdvancedEffects();
  
  // URL 상태 복원
  restorePageState();
  
  // 해시 변경 이벤트 리스너
  window.addEventListener('hashchange', restorePageState);
});

// 고급 이팩트 초기화
function initAdvancedEffects() {
  // 터치 디바이스 지원
  const navButtons = document.querySelectorAll(".nav-button");

  navButtons.forEach(function (button) {
    // 터치 이벤트 추가
    button.addEventListener("touchstart", function (e) {
      this.style.transform = "translateY(-2px) scale(0.98)";
    });

    button.addEventListener("touchend", function (e) {
      setTimeout(() => {
        this.style.transform = "";
      }, 100);
    });
  });

  // 페이지 로드 애니메이션
  setTimeout(function () {
    document.querySelector(".container").style.opacity = "1";
  }, 100);
}

// ===== 네비게이션 기능 =====
function initNavigation() {
  const navButtons = document.querySelectorAll(".nav-button");
  const sections = document.querySelectorAll(".content-section");
  const mainContainer = document.querySelector(".container");

  navButtons.forEach(function (button) {
    // 기본 클릭 이벤트
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Ripple 효과 추가
      createRipple(e, this);

      const targetSection = this.getAttribute("data-section");

      // 약간의 딜레이 후 섹션 전환
      setTimeout(function () {
        showSection(targetSection);
      }, 100);
    });
  });
}

// Ripple 효과 생성 함수
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

  // 기존 ripple 제거
  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);

  // 0.6초 후 제거
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

  // 메인 컨테이너 숨기기
  mainContainer.style.display = "none";

  // 모든 섹션 숨기기
  allSections.forEach(function (section) {
    section.classList.remove("active");
  });

  // 타겟 섹션 보이기
  if (targetSection) {
    targetSection.classList.add("active");
    // URL 업데이트
    updateURL(sectionName);
  }
}

function goHome() {
  const mainContainer = document.querySelector(".container");
  const allSections = document.querySelectorAll(".content-section");

  // 모든 섹션 숨기기
  allSections.forEach(function (section) {
    section.classList.remove("active");
  });

  // 메인 컨테이너 보이기
  mainContainer.style.display = "flex";
  
  // URL 업데이트
  updateURL();
}

// ===== 통계 카운터 애니메이션 =====
function animateStats() {
  const statNumbers = document.querySelectorAll(".stat-number");

  statNumbers.forEach(function (stat) {
    const target = parseInt(stat.getAttribute("data-target"));
    const duration = 2000; // 2초
    const step = target / (duration / 16); // 60fps
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

// ===== 연락처 폼 처리 =====
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 폼 데이터 가져오기
    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const message = formData.get("message").trim();

    // 간단한 유효성 검사
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

    // 전송 처리 시뮬레이션
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

// ===== 이메일 유효성 검사 =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== 키보드 단축키 =====
document.addEventListener("keydown", function (e) {
  // ESC: 홈으로 돌아가기
  if (e.key === "Escape") {
    goHome();
  }
});

// ===== 페이지 로드 완료 후 =====
window.addEventListener("load", function () {
  console.log(
    "%c✨ Clean Portfolio",
    "color: #68C7C1; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%c📚 HTML5 · CSS3 · JavaScript + Clean Effects",
    "color: #9281CD; font-size: 12px;"
  );
  console.log(
    "%c🧽 Simple · Clean · Smooth",
    "color: #566A8E; font-size: 12px;"
  );

  // 로딩 시간 측정
  const loadTime = performance.now();
  console.log(`⚡ 로딩 시간: ${Math.round(loadTime)}ms`);

  // 깨끗한 디자인 메시지
  console.log(
    "%c🚀 깨끗하고 간단한 포트폴리오가 준비되었습니다!",
    "color: #D8634F; font-size: 14px; font-weight: bold;"
  );
});

// ===== 에러 처리 =====
window.addEventListener("error", function (e) {
  console.error("❌ 오류 발생:", e.message);
});

// ===== 유틸리티 함수들 =====

// 현재 시간 반환
function getCurrentTime() {
  return new Date().toLocaleTimeString("ko-KR");
}

// 요소가 화면에 보이는지 확인
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

// ===== 전역 함수 (HTML에서 호출 가능) =====
window.goHome = goHome;
window.showSection = showSection;
window.slideProjects = slideProjects;
