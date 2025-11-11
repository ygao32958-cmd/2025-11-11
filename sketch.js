// === 新增響應式和選單狀態變數 ===
let isMobile = false; 
let menuOpen = false; 
let mobileMenuWidth; 
let currentMenuX = 0;

const BREAKPOINT = 768; 
const HAMBURGER_SIZE = 40; 

let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];

// === 選單項目設定 (含下拉子選單) ===
let menuItems = [
  { label: "第一單元作品", link: "https://ygao32958-cmd.github.io/20251014/" },
  { label: "第一單元講義", link: "https://hackmd.io/@VrbvM8VNTM25jIpeWHaoww/B1OltOk3gx" },
  { label: "測驗系統", link: "https://ygao32958-cmd.github.io/2025-002/" },
  { label: "總結筆記", link: "https://hackmd.io/@VrbvM8VNTM25jIpeWHaoww/ByueHtF1We" },
  { 
    label: "淡江大學 ▼", 
    submenu: [
      { label: "教育科技", link: "https://www.et.tku.edu.tw/" }
    ]
  },
  { label: "返回首頁", link: null }
];

let menuWidth, menuHeight, menuItemHeight;

let iframe;
let animating = false;
let hoverIndex = -1;  
let activeIndex = -1; 
let showBackground = true;
let showSubmenu = false; // 控制子選單是否展開

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id('p5-canvas');
  rectMode(CENTER);
  textAlign(LEFT, CENTER);
  textSize(20);
  objs.push(new DynamicShape());

  menuHeight = height;
  menuItemHeight = menuHeight / menuItems.length;
  
  checkBreakpoint();
}

function draw() {
  background(255);

  // === 背景圖形 ===
  if (showBackground) {
    for (let i of objs) i.run();
    let speedFactor = map(mouseX, 0, width, 5, 40);
    if (frameCount % int(random([speedFactor, speedFactor + 10])) == 0) {
      let addNum = int(random(1, 10));
      for (let i = 0; i < addNum; i++) objs.push(new DynamicShape());
    }
    objs = objs.filter(o => !o.isDead);
  }

  if (isMobile) {
    drawMobileMenu(mobileMenuWidth);
    drawHamburger();
  } else {
    drawMenu(menuWidth);
  }
}

function checkBreakpoint() {
  if (width <= BREAKPOINT) {
    isMobile = true;
    mobileMenuWidth = width * 0.7; 
    menuWidth = 0;
    currentMenuX = menuOpen ? 0 : -mobileMenuWidth; 
  } else {
    isMobile = false;
    menuOpen = false;
    menuWidth = width / 7;
    currentMenuX = 0; 
  }

  let currentIframeX = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  let currentIframeW = width - currentIframeX;

  if (iframe) {
    iframe.position(currentIframeX, 0);
    iframe.size(currentIframeW, height);
  }
}

function drawHamburger() {
  push();
  let x = width - HAMBURGER_SIZE / 2 - 15; 
  let y = HAMBURGER_SIZE / 2 + 15;
  let lineLength = HAMBURGER_SIZE * 0.6;
  let lineWeight = 3;
  let spacing = HAMBURGER_SIZE * 0.2;

  translate(x, y);
  stroke(0);
  strokeWeight(lineWeight);
  noFill();
  circle(0, 0, HAMBURGER_SIZE);

  if (!menuOpen) {
    line(-lineLength / 2, -spacing, lineLength / 2, -spacing);
    line(-lineLength / 2, 0, lineLength / 2, 0);
    line(-lineLength / 2, spacing, lineLength / 2, spacing);
  } else {
    rotate(PI / 4);
    line(-lineLength / 2, 0, lineLength / 2, 0);
    rotate(PI / 2);
    line(-lineLength / 2, 0, lineLength / 2, 0);
  }
  pop();
}

function drawMenu(currentWidth) {
  push();
  noStroke();
  fill(255, 255, 153, 200); 
  rectMode(CORNER);
  rect(0, 0, currentWidth, menuHeight);

  textSize(22);
  textAlign(LEFT, CENTER);

  let y = 0;
  for (let i = 0; i < menuItems.length; i++) {
    fill(i === hoverIndex || i === activeIndex ? '#ff0000' : '#000000');
    text(menuItems[i].label, 10, y + menuItemHeight/2);

    if (menuItems[i].submenu && (i === activeIndex || i === hoverIndex) && showSubmenu) {
      for (let j = 0; j < menuItems[i].submenu.length; j++) {
        text("　" + menuItems[i].submenu[j].label, 20, y + menuItemHeight + (j * menuItemHeight/1.25));
      }
    }

    y += menuItemHeight;
    if (menuItems[i].submenu && showSubmenu) y += menuItems[i].submenu.length * menuItemHeight/1.25;
  }
  pop();
}

function drawMobileMenu(targetWidth) {
  let targetX = menuOpen ? 0 : -targetWidth;
  currentMenuX = lerp(currentMenuX, targetX, 0.2); 

  push();
  translate(currentMenuX, 0);
  drawMenu(targetWidth);
  pop();

  if (iframe) {
    let iframeX = currentMenuX + targetWidth;
    iframe.position(iframeX, 0);
    iframe.size(width - iframeX, height);
  }
}

function mouseMoved() {
  let currentActiveMenuWidth = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  
  if (mouseX < currentActiveMenuWidth) {
    if ((isMobile && menuOpen && mouseX >= currentMenuX) || !isMobile) {
        hoverIndex = floor(mouseY / menuItemHeight);
    } else {
        hoverIndex = -1;
    }
  } else {
    hoverIndex = -1;
  }
}

function mousePressed() {
  if (isMobile) {
    if (mouseX > width - HAMBURGER_SIZE - 15 && mouseY < HAMBURGER_SIZE + 15) {
      menuOpen = !menuOpen; 
      return; 
    }
  }

  let currentActiveMenuWidth = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  
  if (mouseX < currentActiveMenuWidth && !animating) {
    let y = 0;
    for (let i = 0; i < menuItems.length; i++) {
      let item = menuItems[i];
      if (mouseY > y && mouseY < y + menuItemHeight) {
        if (item.submenu) {
          showSubmenu = !showSubmenu;
          activeIndex = i;
          return;
        } else {
          handleLink(item);
          return;
        }
      }
      y += menuItemHeight;

      if (item.submenu && showSubmenu) {
        for (let j = 0; j < item.submenu.length; j++) {
          if (mouseY > y && mouseY < y + menuItemHeight/1.25) {
            handleLink(item.submenu[j]);
            return;
          }
          y += menuItemHeight/1.25;
        }
      }
    }
  }
}

function handleLink(item) {
  activeIndex = -1;
  showBackground = false;
  let content = document.getElementById("content");

  if (item.label === "返回首頁") {
    fadeIframeOut();
    showBackground = true;
    content.style.visibility = 'visible';
  } else {
    fadeIframeTo(item.link);
    content.style.visibility = 'hidden';
  }

  if (isMobile) setTimeout(() => (menuOpen = false), 150);
}

// === iframe 控制 ===
function fadeIframeTo(url) {
  animating = true;
  let currentIframeX = isMobile && menuOpen ? mobileMenuWidth : menuWidth;
  let currentIframeW = width - currentIframeX;

  if (!iframe) {
    iframe = createElement("iframe");
    iframe.position(currentIframeX, 0);
    iframe.size(currentIframeW, height);
    iframe.style("border", "none");
    iframe.style("opacity", "0");
    iframe.attribute("src", url);
    iframe.show();
    fadeIn(iframe, 500, () => (animating = false));
  } else {
    fadeOut(iframe, 500, () => {
      iframe.attribute("src", url);
      iframe.position(currentIframeX, 0);
      iframe.size(currentIframeW, height);
      fadeIn(iframe, 500, () => (animating = false));
    });
  }
}

function fadeIframeOut() {
  if (iframe) {
    animating = true;
    fadeOut(iframe, 500, () => {
      iframe.remove();
      iframe = null;
      animating = false;
    });
  }
}

function fadeIn(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "1");
  setTimeout(callback, duration);
}

function fadeOut(el, duration, callback) {
  el.style("transition", `opacity ${duration}ms ease`);
  el.style("opacity", "0");
  setTimeout(callback, duration);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  menuHeight = height;
  menuItemHeight = menuHeight / menuItems.length;
  checkBreakpoint();
}

function easeInOutExpo(x) {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5
    ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
  constructor() {
    this.x = random(0.25, 0.75) * width;
    this.y = random(0.25, 0.75) * height;
    this.reductionRatio = 1;
    this.shapeType = int(random(4));
    this.animationType = 0;
    this.maxActionPoints = int(random(2, 5));
    this.actionPoints = this.maxActionPoints;
    this.elapsedT = 0;
    this.size = 0;
    this.sizeMax = width * random(0.01, 0.05);
    this.fromSize = 0;
    this.init();
    this.isDead = false;
    this.clr = random(colors);
    this.changeShape = true;
    this.ang = int(random(2)) * PI * 0.25;
    this.lineSW = 0;
  }

  show() {
    push();
    translate(this.x, this.y);
    if (this.animationType == 1) scale(1, this.reductionRatio);
    if (this.animationType == 2) scale(this.reductionRatio, 1);
    fill(this.clr);
    stroke(this.clr);
    strokeWeight(this.size * 0.05);
    if (this.shapeType == 0) {
      noStroke();
      circle(0, 0, this.size);
    } else if (this.shapeType == 1) {
      noFill();
      circle(0, 0, this.size);
    } else if (this.shapeType == 2) {
      noStroke();
      rect(0, 0, this.size, this.size);
    } else if (this.shapeType == 3) {
      noFill();
      rect(0, 0, this.size * 0.9, this.size * 0.9);
    }
    pop();
    strokeWeight(this.lineSW);
    stroke(this.clr);
    line(this.x, this.y, this.fromX, this.fromY);
  }

  move() {
    let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
    if (0 < this.elapsedT && this.elapsedT < this.duration) {
      if (this.actionPoints == this.maxActionPoints) {
        this.size = lerp(0, this.sizeMax, n);
      } else if (this.actionPoints > 0) {
        if (this.animationType == 0) {
          this.size = lerp(this.fromSize, this.toSize, n);
        } else if (this.animationType == 1) {
          this.x = lerp(this.fromX, this.toX, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        } else if (this.animationType == 2) {
          this.y = lerp(this.fromY, this.toY, n);
          this.lineSW = lerp(0, this.size / 5, sin(n * PI));
        }
        this.reductionRatio = lerp(1, 0.3, sin(n * PI));
      } else {
        this.size = lerp(this.fromSize, 0, n);
      }
    }

    this.elapsedT++;
    if (this.elapsedT > this.duration) {
      this.actionPoints--;
      this.init();
    }
    if (this.actionPoints < 0) {
      this.isDead = true;
    }
  }

  run() {
    this.show();
    this.move();
  }

  init() {
    this.elapsedT = 0;
    this.fromSize = this.size;
    this.toSize = this.sizeMax * random(0.5, 1.5);
    this.fromX = this.x;
    this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
    this.fromY = this.y;
    this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
    this.animationType = int(random(3));
    this.duration = random(20, 50);
  }
}















