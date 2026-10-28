var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import { useState, useEffect, useRef } from "react";
const BASE_URL = "http://learnix.local";
const LOGO_URL = `${BASE_URL}/pluginfile.php/1/core_admin/logocompact/300x300/1793054100/image-removebg-preview.png`;
const REFRESH_MS = 15e3;
const NODE_COLORS = ["#8B5CF6", "#06B6D4", "#10B981"];
const PAGE_CLASS = "lx-dashboard-page";
const EMPTY_USER = {
  fullname: "",
  firstname: "",
  avatar: "",
  coins: 0,
  level: 1,
  completedActivities: 0
};
const fallbackCourseImages = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"
];
const MOD_ICONS = {
  quiz: "fa-bolt lx-tone-warning",
  assign: "fa-file-signature lx-tone-info",
  forum: "fa-comments lx-tone-primary",
  page: "fa-file-lines lx-tone-success",
  resource: "fa-file-pdf lx-tone-danger",
  url: "fa-link lx-tone-info",
  book: "fa-book-open lx-tone-primary",
  scorm: "fa-cube lx-tone-warning",
  h5pactivity: "fa-puzzle-piece lx-tone-success"
};
const NAV_ITEMS = [
  { id: "dashboard", icon: "fa-border-all", label: "Dashboard" },
  { id: "calendar", icon: "fa-calendar-days", label: "Calendar & Timeline" },
  { id: "trophies", icon: "fa-award", label: "Trophies & Badges" },
  { id: "preferences", icon: "fa-sliders", label: "Account Preferences" }
];
const getModIcon = /* @__PURE__ */ __name((modname) => MOD_ICONS[modname] || "fa-circle-nodes lx-tone-info", "getModIcon");
const delayStyle = /* @__PURE__ */ __name((seconds) => ({ animationDelay: `${seconds}s` }), "delayStyle");
const stagger = /* @__PURE__ */ __name((base, idx) => delayStyle(base * (idx + 1)), "stagger");
const getGreeting = /* @__PURE__ */ __name(() => {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  if (hour < 12) {
    return "Good morning, stay creative";
  }
  if (hour < 18) {
    return "Good afternoon, stay productive";
  }
  return "Good evening, enjoy your journey";
}, "getGreeting");
const createNodes = /* @__PURE__ */ __name((width, height) => Array.from({ length: 45 }, (_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.8,
  vy: (Math.random() - 0.5) * 0.8,
  radius: Math.random() * 2.8 + 2.2,
  color: NODE_COLORS[i % NODE_COLORS.length]
})), "createNodes");
const bounce = /* @__PURE__ */ __name((pos, vel, max) => pos < 0 || pos > max ? -vel : vel, "bounce");
const stepNode = /* @__PURE__ */ __name((n, width, height) => {
  const x = n.x + n.vx;
  const y = n.y + n.vy;
  return { ...n, x, y, vx: bounce(x, n.vx, width), vy: bounce(y, n.vy, height) };
}, "stepNode");
const drawLink = /* @__PURE__ */ __name((ctx, a, b, isDark) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist >= 160) {
    return;
  }
  const alpha = (1 - dist / 160) * (isDark ? 0.25 : 0.15);
  const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  grad.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
  grad.addColorStop(0.5, `rgba(6, 182, 212, ${alpha})`);
  grad.addColorStop(1, `rgba(16, 185, 129, ${alpha})`);
  ctx.beginPath();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.2;
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}, "drawLink");
const drawNode = /* @__PURE__ */ __name((ctx, n) => {
  ctx.beginPath();
  ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0F172A";
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = n.color;
  ctx.stroke();
}, "drawNode");
const normalizeCourse = /* @__PURE__ */ __name((c, idx) => ({
  ...c,
  shortname: c.shortname || `CRS-${c.id}`,
  courseimage: c.courseimage || fallbackCourseImages[idx % fallbackCourseImages.length],
  doneCount: c.done_count || (c.done_list ? c.done_list.length : 0),
  todoCount: c.todo_count || (c.todo_list ? c.todo_list.length : 0),
  doneList: c.done_list || [],
  todoList: c.todo_list || [],
  timeSpent: c.time_spent || "0h 0m",
  enrolledSince: c.enrolled_since || "-",
  outcomes: c.outcomes || [
    `Master core concepts of ${c.fullname}`,
    "Complete interactive milestones & practical tasks",
    "Achieve target grade benchmark"
  ],
  coinsEarned: (c.progress || 0) * 5,
  rewardCoins: c.reward_coins || 0
}), "normalizeCourse");
const parseResponse = /* @__PURE__ */ __name((response) => {
  if (Array.isArray(response)) {
    return { user: null, courses: response, suggested: null };
  }
  if (!response || typeof response !== "object") {
    return { user: null, courses: [], suggested: null };
  }
  return {
    user: response.user ? { ...response.user, completedActivities: response.user.completed_activities } : null,
    courses: Array.isArray(response.courses) ? response.courses : [],
    suggested: Array.isArray(response.suggested) ? response.suggested : null
  };
}, "parseResponse");
const buildTimeline = /* @__PURE__ */ __name((courses) => courses.flatMap(
  (course) => course.todoList.map((task) => ({
    ...task,
    coursename: course.fullname,
    courseimage: course.courseimage
  }))
), "buildTimeline");
const computeStats = /* @__PURE__ */ __name((courses, user) => {
  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.progress === 100).length;
  const totalDone = courses.reduce((acc, c) => acc + c.doneCount, 0);
  const totalTodo = courses.reduce((acc, c) => acc + c.todoCount, 0);
  const progressSum = courses.reduce((acc, c) => acc + c.progress, 0);
  return {
    totalCourses,
    completedCourses,
    activeCourses: totalCourses - completedCourses,
    avgProgress: totalCourses ? Math.round(progressSum / totalCourses) : 0,
    totalDone,
    totalTodo,
    totalCoins: user.coins || totalDone * 25 + completedCourses * 150 + totalCourses * 50
  };
}, "computeStats");
const buildStatCards = /* @__PURE__ */ __name((stats) => [
  {
    label: "Total Enrolled Courses",
    value: stats.totalCourses,
    sub: `${stats.activeCourses} currently active`,
    icon: "fa-layer-group",
    grad: "lx-grad-purple-cyan"
  },
  {
    label: "Completed Activities (Done)",
    value: stats.totalDone,
    sub: "+25 LX Coin per activity",
    icon: "fa-circle-check",
    grad: "lx-grad-cyan-emerald"
  },
  {
    label: "Remaining Activities (To-Do)",
    value: stats.totalTodo,
    sub: "Pending tasks",
    icon: "fa-hourglass-half",
    grad: "lx-grad-purple-cyan"
  },
  {
    label: "100% Completed Courses",
    value: stats.completedCourses,
    sub: "Certificates and achieved outcomes",
    icon: "fa-trophy",
    grad: "lx-grad-cyan-emerald"
  }
], "buildStatCards");
const buildChartData = /* @__PURE__ */ __name((courses) => courses.map((c) => ({
  name: c.fullname.length > 14 ? `${c.fullname.substring(0, 14)}...` : c.fullname,
  progress: c.progress,
  done: c.doneCount,
  todo: c.todoCount
})), "buildChartData");
const loadAjax = /* @__PURE__ */ __name((attempt = 0) => new Promise((resolve, reject) => {
  window.require(["core/ajax"], resolve, reject);
}).catch((err) => attempt < 2 ? loadAjax(attempt + 1) : Promise.reject(err)), "loadAjax");
const callService = /* @__PURE__ */ __name((methodname, args) => loadAjax().then((moodleAjax) => moodleAjax.call([{ methodname, args }])[0]), "callService");
const useDashboardPageClass = /* @__PURE__ */ __name(() => {
  useEffect(() => {
    document.body.classList.add(PAGE_CLASS);
    return () => {
      document.body.classList.remove(PAGE_CLASS);
    };
  }, []);
}, "useDashboardPageClass");
const useCountUp = /* @__PURE__ */ __name((target, duration = 1100) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let frameId = 0;
    const tick = /* @__PURE__ */ __name((now) => {
      const t = Math.min(1, (now - start) / duration);
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      fromRef.current = next;
      setValue(next);
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }, "tick");
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return value;
}, "useCountUp");
const CountUp = /* @__PURE__ */ __name(({ value, suffix = "" }) => {
  const current = useCountUp(value);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    current,
    suffix
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 318,
    columnNumber: 12
  });
}, "CountUp");
const useStudentData = /* @__PURE__ */ __name(() => {
  const [user, setUser] = useState(EMPTY_USER);
  const [courses, setCourses] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const applyResponse = /* @__PURE__ */ __name((response) => {
      const parsed = parseResponse(response);
      if (parsed.user) {
        setUser(parsed.user);
      }
      if (parsed.suggested) {
        setSuggested(parsed.suggested.map(normalizeCourse));
      }
      const processed = parsed.courses.map(normalizeCourse);
      setCourses(processed);
      setTimeline(buildTimeline(processed));
    }, "applyResponse");
    const load = /* @__PURE__ */ __name(async () => {
      const response = await callService("local_reactlive_get_student_data", {});
      applyResponse(response);
    }, "load");
    const fetchData = /* @__PURE__ */ __name(() => load().catch((err) => {
      console.error("reactlive: failed to load student data", err);
      return null;
    }).finally(() => setLoading(false)), "fetchData");
    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, []);
  return { user, courses, suggested, timeline, loading };
}, "useStudentData");
const NeuralCanvas = /* @__PURE__ */ __name(({ isDark }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!canvas || !canvas.parentElement || !ctx) {
      return void 0;
    }
    const parent = canvas.parentElement;
    let frameId = 0;
    const resize = /* @__PURE__ */ __name(() => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }, "resize");
    resize();
    window.addEventListener("resize", resize);
    let nodes = createNodes(canvas.width, canvas.height);
    const render = /* @__PURE__ */ __name(() => {
      nodes = nodes.map((n) => stepNode(n, canvas.width, canvas.height));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n1, i) => {
        nodes.slice(i + 1).forEach((n2) => drawLink(ctx, n1, n2, isDark));
        drawNode(ctx, n1);
      });
      frameId = requestAnimationFrame(render);
    }, "render");
    render();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);
  return /* @__PURE__ */ jsxDEV("canvas", { ref: canvasRef, className: "lx-canvas-bg" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 400,
    columnNumber: 12
  });
}, "NeuralCanvas");
const StatCard = /* @__PURE__ */ __name(({ item, idx }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-anim", style: stagger(0.08, idx), children: /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-card-interactive lx-stat", children: [
  /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("span", { className: "lx-stat-label lx-muted", children: item.label }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 407,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("h2", { className: "lx-stat-value lx-title", children: /* @__PURE__ */ jsxDEV(CountUp, { value: item.value }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 408,
      columnNumber: 56
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 408,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-stat-sub lx-text-grad-2", children: item.sub }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 409,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 406,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("div", { className: `lx-stat-icon ${item.grad}`, children: /* @__PURE__ */ jsxDEV("i", { className: `fa ${item.icon}` }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 412,
    columnNumber: 17
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 411,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 405,
  columnNumber: 9
}) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 404,
  columnNumber: 5
}), "StatCard");
const TimelineItem = /* @__PURE__ */ __name(({ task, idx }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-timeline-item lx-anim", style: stagger(0.1, idx), children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-timeline-dot" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 420,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-timeline-content", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-tl-row", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-tl-main", children: [
      /* @__PURE__ */ jsxDEV("img", { src: task.courseimage, alt: "course", className: "lx-tl-thumb" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 424,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h5", { className: "lx-tl-title lx-title", children: [
          /* @__PURE__ */ jsxDEV("i", { className: `fa ${getModIcon(task.modname)}` }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 427,
            columnNumber: 29
          }),
          task.name
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 426,
          columnNumber: 25
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-tl-course lx-muted", children: [
          "Course: ",
          /* @__PURE__ */ jsxDEV("span", { className: "lx-text-grad-2", children: [
            " ",
            task.coursename
          ] }, void 0, true, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 431,
            columnNumber: 37
          })
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 430,
          columnNumber: 25
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 425,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 423,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-tl-side", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-due", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-clock" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 437,
          columnNumber: 25
        }),
        " Due: ",
        task.date
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 436,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("a", { href: task.url, className: "lx-btn-action lx-btn-small", children: [
        "Open Task ",
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-external-link-alt" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 440,
          columnNumber: 35
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 439,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 435,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 422,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 421,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 419,
  columnNumber: 5
}), "TimelineItem");
const CourseBanner = /* @__PURE__ */ __name(({ course }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-course-banner", children: [
  /* @__PURE__ */ jsxDEV("img", { src: course.courseimage, alt: course.fullname }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 450,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-banner-overlay", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-banner-top", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-code", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-cube" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 454,
          columnNumber: 21
        }),
        course.shortname
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 453,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-grad-cyan-emerald", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-coins" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 458,
          columnNumber: 21
        }),
        "+",
        course.coinsEarned,
        " LX"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 457,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 452,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("h5", { className: "lx-banner-title", title: course.fullname, children: course.fullname }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 462,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 451,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 449,
  columnNumber: 5
}), "CourseBanner");
const MiniStat = /* @__PURE__ */ __name(({ label, value, icon, tone }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-mini-stat", children: [
  /* @__PURE__ */ jsxDEV("span", { className: "lx-mini-label lx-muted", children: label }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 471,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("span", { className: `lx-mini-value ${tone}`, children: [
    icon && /* @__PURE__ */ jsxDEV("i", { className: `fa ${icon} lx-ico-sm` }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 473,
      columnNumber: 22
    }),
    value
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 472,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 470,
  columnNumber: 5
}), "MiniStat");
const CourseStats = /* @__PURE__ */ __name(({ course }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-mini-grid", children: [
  /* @__PURE__ */ jsxDEV(MiniStat, { label: "Enrolled", value: course.enrolledSince, tone: "lx-title" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 481,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV(MiniStat, { label: "Time Spent", value: course.timeSpent, icon: "fa-stopwatch", tone: "lx-tone-warning" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 482,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV(MiniStat, { label: "Completed", value: course.doneCount, icon: "fa-check-circle", tone: "lx-tone-success" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 483,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV(MiniStat, { label: "Remaining", value: course.todoCount, icon: "fa-clock", tone: "lx-tone-info" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 484,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 480,
  columnNumber: 5
}), "CourseStats");
const CourseProgress = /* @__PURE__ */ __name(({ progress }) => {
  const gradClass = progress === 100 ? "lx-grad-cyan-emerald" : "lx-grad-purple-cyan";
  return /* @__PURE__ */ jsxDEV("div", { className: "lx-progress-wrap", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-progress-head", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-progress-label lx-muted", children: "Course Completion" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 493,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-progress-value lx-text-grad-2", children: [
        progress,
        "%"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 494,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 492,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-progress-track", children: /* @__PURE__ */ jsxDEV("div", { className: `lx-progress-bar ${gradClass}`, style: { width: `${progress}%` } }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 497,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 496,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 491,
    columnNumber: 9
  });
}, "CourseProgress");
const CourseTabs = /* @__PURE__ */ __name(({ course, activeTab, onSelect }) => {
  const tabs = [
    { id: "outcomes", icon: "fa-bullseye", label: "Outcomes" },
    { id: "done", icon: "fa-check", label: `(${course.doneCount})` },
    { id: "todo", icon: "fa-list-check", label: `(${course.todoCount})` }
  ];
  return /* @__PURE__ */ jsxDEV("div", { className: "lx-tabs", children: tabs.map((tab) => /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      className: `lx-tab-btn ${activeTab === tab.id ? "active" : ""}`,
      onClick: () => onSelect(tab.id),
      children: [
        /* @__PURE__ */ jsxDEV("i", { className: `fa ${tab.icon} lx-ico-sm` }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 518,
          columnNumber: 21
        }),
        tab.label
      ]
    },
    tab.id,
    true,
    {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 512,
      columnNumber: 17
    }
  )) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 510,
    columnNumber: 9
  });
}, "CourseTabs");
const OutcomeList = /* @__PURE__ */ __name(({ items }) => /* @__PURE__ */ jsxDEV("div", { children: items.map((out, oIdx) => /* @__PURE__ */ jsxDEV("div", { className: "lx-activity-item lx-outcome", children: [
  /* @__PURE__ */ jsxDEV("i", { className: "fa fa-gem lx-text-grad-1" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 530,
    columnNumber: 17
  }),
  /* @__PURE__ */ jsxDEV("span", { className: "lx-outcome-text lx-title", children: out }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 531,
    columnNumber: 17
  })
] }, oIdx, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 529,
  columnNumber: 13
})) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 527,
  columnNumber: 5
}), "OutcomeList");
const ActivityRow = /* @__PURE__ */ __name(({ act, children }) => /* @__PURE__ */ jsxDEV("a", { href: act.url, className: "lx-activity-item", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-activity-main", children: [
    /* @__PURE__ */ jsxDEV("i", { className: `fa ${getModIcon(act.modname)}` }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 540,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-activity-name lx-title", children: act.name }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 541,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 539,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-activity-meta", children }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 543,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 538,
  columnNumber: 5
}), "ActivityRow");
const DoneList = /* @__PURE__ */ __name(({ items }) => {
  if (items.length === 0) {
    return /* @__PURE__ */ jsxDEV("div", { className: "lx-activity-empty lx-muted", children: "You haven't completed any activities in this course yet." }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 550,
      columnNumber: 13
    });
  }
  return /* @__PURE__ */ jsxDEV("div", { children: items.map((act) => /* @__PURE__ */ jsxDEV(ActivityRow, { act, children: [
    /* @__PURE__ */ jsxDEV("span", { className: "lx-activity-date lx-muted lx-hide-sm", children: act.date }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 559,
      columnNumber: 21
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-done", children: "+25 LX" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 560,
      columnNumber: 21
    })
  ] }, act.id, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 558,
    columnNumber: 17
  })) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 556,
    columnNumber: 9
  });
}, "DoneList");
const TodoList = /* @__PURE__ */ __name(({ items }) => {
  if (items.length === 0) {
    return /* @__PURE__ */ jsxDEV("div", { className: "lx-activity-empty lx-tone-success", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-party-horn lx-ico-sm" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 571,
        columnNumber: 17
      }),
      " Awesome! All done."
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 570,
      columnNumber: 13
    });
  }
  return /* @__PURE__ */ jsxDEV("div", { children: items.map((act) => /* @__PURE__ */ jsxDEV(ActivityRow, { act, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-due lx-hide-sm", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-due-label lx-muted", children: "Due Date" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 580,
        columnNumber: 25
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-due-date", children: act.date }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 581,
        columnNumber: 25
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 579,
      columnNumber: 21
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-start", children: [
      "Start ",
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-right" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 584,
        columnNumber: 31
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 583,
      columnNumber: 21
    })
  ] }, act.id, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 578,
    columnNumber: 17
  })) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 576,
    columnNumber: 9
  });
}, "TodoList");
const CourseTabBody = /* @__PURE__ */ __name(({ course, activeTab }) => {
  if (activeTab === "done") {
    return /* @__PURE__ */ jsxDEV(DoneList, { items: course.doneList }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 594,
      columnNumber: 16
    });
  }
  if (activeTab === "todo") {
    return /* @__PURE__ */ jsxDEV(TodoList, { items: course.todoList }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 597,
      columnNumber: 16
    });
  }
  return /* @__PURE__ */ jsxDEV(OutcomeList, { items: course.outcomes }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 599,
    columnNumber: 12
  });
}, "CourseTabBody");
const CourseFooter = /* @__PURE__ */ __name(({ course }) => {
  const isCompleted = course.progress === 100;
  const view = isCompleted ? { note: "Fully Completed", cta: "Review Course", icon: "fa-award", btn: "lx-btn-emerald" } : { note: `${100 - course.progress}% remaining`, cta: "Continue Learning", icon: "fa-rocket", btn: "" };
  return /* @__PURE__ */ jsxDEV("div", { className: "lx-course-foot", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "lx-course-foot-note lx-muted", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-shield-halved lx-tone-info lx-ico-sm" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 610,
        columnNumber: 17
      }),
      view.note
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 609,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("a", { href: `/course/view.php?id=${course.id}`, className: `lx-btn-action ${view.btn}`, children: [
      view.cta,
      /* @__PURE__ */ jsxDEV("i", { className: `fa ${view.icon}` }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 615,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 613,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 608,
    columnNumber: 9
  });
}, "CourseFooter");
const CourseCard = /* @__PURE__ */ __name(({ course, idx, activeTab, setCourseTab }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-anim", style: stagger(0.1, idx), children: /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-card-interactive lx-course", children: [
  /* @__PURE__ */ jsxDEV(CourseBanner, { course }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 629,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-course-body", children: [
    /* @__PURE__ */ jsxDEV(CourseStats, { course }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 631,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(CourseProgress, { progress: course.progress }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 632,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(CourseTabs, { course, activeTab, onSelect: (tab) => setCourseTab(course.id, tab) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 633,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-scroll-box", children: /* @__PURE__ */ jsxDEV(CourseTabBody, { course, activeTab }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 635,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 634,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(CourseFooter, { course }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 637,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 630,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 628,
  columnNumber: 9
}) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 627,
  columnNumber: 5
}), "CourseCard");
const SuggestedCard = /* @__PURE__ */ __name(({ course, idx }) => {
  const image = course.courseimage || fallbackCourseImages[(idx + 2) % fallbackCourseImages.length];
  return /* @__PURE__ */ jsxDEV("div", { className: "lx-anim", style: stagger(0.1, idx), children: /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-card-interactive lx-course", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-course-banner lx-course-banner-short", children: [
      /* @__PURE__ */ jsxDEV("img", { src: image, alt: course.fullname }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 649,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-banner-overlay", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-banner-top", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-compact lx-badge-category", children: course.category }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 652,
          columnNumber: 29
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-compact lx-grad-cyan-emerald", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-gift" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 654,
            columnNumber: 33
          }),
          " +",
          course.rewardCoins,
          " LX Coins"
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 653,
          columnNumber: 29
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 651,
        columnNumber: 25
      }) }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 650,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 648,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-course-body", children: [
      /* @__PURE__ */ jsxDEV("h5", { className: "lx-suggest-title lx-title", children: course.fullname }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 660,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("p", { className: "lx-suggest-summary lx-muted", children: course.summary }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 661,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-course-foot", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "lx-suggest-avail lx-text-grad-1", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-unlock-keyhole lx-ico-sm" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 664,
            columnNumber: 29
          }),
          " Available for Enrollment"
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 663,
          columnNumber: 25
        }),
        /* @__PURE__ */ jsxDEV("a", { href: course.enrolurl, className: "lx-btn-action lx-btn-emerald", children: [
          "Try and Enroll Now ",
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus-circle" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 667,
            columnNumber: 48
          })
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 666,
          columnNumber: 25
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 662,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 659,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 647,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 646,
    columnNumber: 9
  });
}, "SuggestedCard");
const Avatar = /* @__PURE__ */ __name(({ user }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-avatar-ring", children: user.avatar ? /* @__PURE__ */ jsxDEV("img", { src: user.avatar, alt: user.fullname, className: "lx-avatar-img" }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 679,
  columnNumber: 13
}) : /* @__PURE__ */ jsxDEV("div", { className: "lx-avatar-img lx-avatar-fallback lx-grad-purple-cyan", children: user.fullname ? user.fullname.charAt(0).toUpperCase() : "S" }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 681,
  columnNumber: 13
}) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 677,
  columnNumber: 5
}), "Avatar");
const CoinPill = /* @__PURE__ */ __name(({ icon, grad, label, children }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-coin-pill", children: [
  /* @__PURE__ */ jsxDEV("div", { className: `lx-coin-icon ${grad}`, children: /* @__PURE__ */ jsxDEV("i", { className: `fa ${icon}` }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 691,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 690,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("span", { className: "lx-coin-label lx-muted", children: label }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 694,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-coin-value lx-title", children }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 695,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 693,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 689,
  columnNumber: 5
}), "CoinPill");
const HeroCard = /* @__PURE__ */ __name(({ user, stats, isDark, onToggleTheme }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-hero lx-anim", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-hero-user", children: [
    /* @__PURE__ */ jsxDEV(Avatar, { user }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 708,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "lx-hero-meta", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-compact lx-grad-purple-cyan", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-sparkles" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 712,
            columnNumber: 25
          }),
          " Level ",
          user.level || 1,
          " Explorer"
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 711,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-hero-sub lx-muted", children: "Interactive Experience" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 714,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 710,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("h3", { className: "lx-hero-title lx-title", children: [
        getGreeting(),
        ", ",
        /* @__PURE__ */ jsxDEV("span", { className: "lx-text-grad-2", children: user.fullname }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 717,
          columnNumber: 38
        }),
        " \u{1F44B}"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 716,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("p", { className: "lx-hero-text lx-muted", children: [
        "You have completed ",
        /* @__PURE__ */ jsxDEV("strong", { className: "lx-text-grad-1", children: stats.totalDone }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 720,
          columnNumber: 40
        }),
        " ",
        "learning tasks and you have ",
        /* @__PURE__ */ jsxDEV("strong", { children: [
          stats.totalTodo,
          " tasks"
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 721,
          columnNumber: 54
        }),
        " left!"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 719,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 709,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 707,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-hero-actions", children: [
    /* @__PURE__ */ jsxDEV(CoinPill, { icon: "fa-coins", grad: "lx-grad-cyan-emerald", label: "Platform Coins Balance", children: [
      /* @__PURE__ */ jsxDEV(CountUp, { value: stats.totalCoins }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 727,
        columnNumber: 17
      }),
      " ",
      /* @__PURE__ */ jsxDEV("small", { className: "lx-coin-unit lx-text-grad-2", children: "LX Coins" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 727,
        columnNumber: 54
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 726,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(CoinPill, { icon: "fa-fire", grad: "lx-grad-purple-cyan", label: "Overall Completion Rate", children: /* @__PURE__ */ jsxDEV(CountUp, { value: stats.avgProgress, suffix: "%" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 730,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 729,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        onClick: onToggleTheme,
        className: "lx-theme-toggle",
        title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
        children: /* @__PURE__ */ jsxDEV("i", { className: `fa ${isDark ? "fa-sun lx-tone-warning" : "fa-moon lx-tone-primary"}` }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 738,
          columnNumber: 17
        })
      },
      void 0,
      false,
      {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 732,
        columnNumber: 13
      }
    )
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 725,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 706,
  columnNumber: 5
}), "HeroCard");
const CHART_W = 600;
const CHART_H = 250;
const CHART_PAD = { left: 36, right: 16, top: 12, bottom: 28 };
const CHART_TICKS = [0, 25, 50, 75, 100];
const DONUT_R = 71;
const DONUT_LEN = 2 * Math.PI * DONUT_R;
const smoothPath = /* @__PURE__ */ __name((pts) => pts.reduce((acc, p, i) => {
  if (i === 0) {
    return `M ${p.x} ${p.y}`;
  }
  const prev = pts[i - 1];
  const mid = (prev.x + p.x) / 2;
  return `${acc} C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`;
}, ""), "smoothPath");
const AreaChartSvg = /* @__PURE__ */ __name(({ data }) => {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  const baseY = CHART_PAD.top + innerH;
  const yFor = /* @__PURE__ */ __name((value) => CHART_PAD.top + innerH * (1 - Math.min(100, Math.max(0, value)) / 100), "yFor");
  const points = data.map((d, i) => ({
    ...d,
    x: data.length > 1 ? CHART_PAD.left + innerW / (data.length - 1) * i : CHART_PAD.left + innerW / 2,
    y: yFor(d.progress)
  }));
  const line = points.length === 1 ? [{ x: CHART_PAD.left, y: points[0].y }, { x: CHART_PAD.left + innerW, y: points[0].y }] : points;
  const linePath = smoothPath(line);
  const areaPath = line.length > 0 ? `${linePath} L ${line[line.length - 1].x} ${baseY} L ${line[0].x} ${baseY} Z` : "";
  return /* @__PURE__ */ jsxDEV("svg", { className: "lx-chart-svg", viewBox: `0 0 ${CHART_W} ${CHART_H}`, role: "img", children: [
    /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: "lxAreaGrad", x1: "0", y1: "0", x2: "1", y2: "1", children: [
      /* @__PURE__ */ jsxDEV("stop", { offset: "0%", className: "lx-stop-purple" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 792,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("stop", { offset: "50%", className: "lx-stop-cyan" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 793,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("stop", { offset: "100%", className: "lx-stop-emerald" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 794,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 791,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 790,
      columnNumber: 13
    }),
    CHART_TICKS.map((tick) => /* @__PURE__ */ jsxDEV("g", { children: [
      /* @__PURE__ */ jsxDEV(
        "line",
        {
          className: "lx-chart-grid",
          x1: CHART_PAD.left,
          x2: CHART_W - CHART_PAD.right,
          y1: yFor(tick),
          y2: yFor(tick)
        },
        void 0,
        false,
        {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 799,
          columnNumber: 21
        }
      ),
      /* @__PURE__ */ jsxDEV("text", { className: "lx-chart-label", x: CHART_PAD.left - 8, y: yFor(tick) + 4, textAnchor: "end", children: tick }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 806,
        columnNumber: 21
      })
    ] }, tick, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 798,
      columnNumber: 17
    })),
    areaPath && /* @__PURE__ */ jsxDEV("path", { className: "lx-chart-area", d: areaPath }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 811,
      columnNumber: 26
    }),
    linePath && /* @__PURE__ */ jsxDEV("path", { className: "lx-chart-line", d: linePath, pathLength: 1 }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 812,
      columnNumber: 26
    }),
    points.map((p, i) => /* @__PURE__ */ jsxDEV("g", { children: [
      /* @__PURE__ */ jsxDEV("circle", { className: "lx-chart-dot", cx: p.x, cy: p.y, r: 5, style: delayStyle(0.7 + i * 0.12), children: /* @__PURE__ */ jsxDEV("title", { children: `${p.name}: ${p.progress}%` }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 816,
        columnNumber: 25
      }) }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 815,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("text", { className: "lx-chart-label", x: p.x, y: CHART_H - 8, textAnchor: "middle", children: p.name }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 818,
        columnNumber: 21
      })
    ] }, i, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 814,
      columnNumber: 17
    }))
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 789,
    columnNumber: 9
  });
}, "AreaChartSvg");
const DonutChart = /* @__PURE__ */ __name(({ value }) => {
  const filled = Math.min(100, Math.max(0, value)) / 100 * DONUT_LEN;
  return /* @__PURE__ */ jsxDEV("svg", { className: "lx-donut-svg", viewBox: "0 0 200 200", role: "img", children: [
    /* @__PURE__ */ jsxDEV("circle", { className: "lx-donut-track", cx: "100", cy: "100", r: DONUT_R }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 831,
      columnNumber: 13
    }),
    filled > 0 && /* @__PURE__ */ jsxDEV(
      "circle",
      {
        className: "lx-donut-arc",
        cx: "100",
        cy: "100",
        r: DONUT_R,
        strokeDasharray: `${filled} ${DONUT_LEN}`,
        transform: "rotate(-90 100 100)"
      },
      void 0,
      false,
      {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 833,
        columnNumber: 17
      }
    )
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 830,
    columnNumber: 9
  });
}, "DonutChart");
const ProgressPanel = /* @__PURE__ */ __name(({ data }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-panel", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-panel-head", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h5", { className: "lx-panel-title lx-title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-chart-line lx-ico lx-text-grad-1" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 851,
          columnNumber: 21
        }),
        "Progress Analysis & Task Comparison"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 850,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("p", { className: "lx-panel-desc lx-muted", children: "Live tracking of completion rates in each enrolled course" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 854,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 849,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-due", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-rotate fa-spin" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 859,
        columnNumber: 17
      }),
      " Live Sync"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 858,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 848,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-chart-box", children: /* @__PURE__ */ jsxDEV(AreaChartSvg, { data }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 863,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 862,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 847,
  columnNumber: 5
}), "ProgressPanel");
const MasteryPanel = /* @__PURE__ */ __name(({ stats }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-panel lx-panel-col", children: [
  /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("h5", { className: "lx-panel-title lx-title", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-bullseye lx-ico lx-text-grad-2" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 872,
        columnNumber: 17
      }),
      "Overall Mastery Index"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 871,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "lx-panel-desc lx-muted", children: "Percentage of achieved learning outcomes" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 874,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 870,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-donut-box", children: [
    /* @__PURE__ */ jsxDEV(DonutChart, { value: stats.avgProgress }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 877,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-donut-center", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "lx-donut-value lx-text-grad-2", children: /* @__PURE__ */ jsxDEV(CountUp, { value: stats.avgProgress, suffix: "%" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 879,
        columnNumber: 63
      }) }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 879,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-donut-label lx-muted", children: "Overall Mastery" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 880,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 878,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 876,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-mastery-foot", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-mastery-label lx-muted", children: "Completed" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 885,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-mastery-value lx-tone-success", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-check lx-ico-sm" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 887,
          columnNumber: 21
        }),
        stats.totalDone,
        " activities"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 886,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 884,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("span", { className: "lx-mastery-label lx-muted", children: "Remaining" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 891,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-mastery-value lx-tone-info", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-clock lx-ico-sm" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 893,
          columnNumber: 21
        }),
        stats.totalTodo,
        " activities"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 892,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 890,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 883,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 869,
  columnNumber: 5
}), "MasteryPanel");
const CoursesSection = /* @__PURE__ */ __name(({ courses, query, onQuery, cardTabs, onTab }) => {
  const filtered = courses.filter((c) => c.fullname.toLowerCase().includes(query.toLowerCase()));
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-section-head", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h4", { className: "lx-section-title lx-title", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-graduation-cap lx-ico lx-text-grad-1" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 913,
            columnNumber: 25
          }),
          "My Courses, Progress Details"
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 912,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("p", { className: "lx-section-desc lx-muted", children: "Browse each course's outcomes and tasks" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 916,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 911,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-search", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-search lx-search-icon lx-muted" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 919,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "text",
            className: "lx-search-input",
            placeholder: "Search your courses...",
            value: query,
            onChange: (e) => onQuery(e.target.value)
          },
          void 0,
          false,
          {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 920,
            columnNumber: 21
          }
        )
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 918,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 910,
      columnNumber: 13
    }),
    filtered.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-empty", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-folder-open lx-empty-icon lx-text-grad-1" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 932,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("h5", { className: "lx-empty-title lx-title", children: "No matching courses found" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 933,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("p", { className: "lx-muted", children: "Explore suggested courses below and start learning now!" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 934,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 931,
      columnNumber: 17
    }) : /* @__PURE__ */ jsxDEV("div", { className: "lx-grid lx-grid-courses", children: filtered.map((course, idx) => /* @__PURE__ */ jsxDEV(
      CourseCard,
      {
        course,
        idx,
        activeTab: cardTabs[course.id] || "outcomes",
        setCourseTab: onTab
      },
      course.id,
      false,
      {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 939,
        columnNumber: 25
      }
    )) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 937,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 909,
    columnNumber: 9
  });
}, "CoursesSection");
const SuggestedSection = /* @__PURE__ */ __name(({ suggested }) => /* @__PURE__ */ jsxDEV(Fragment, { children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-section-head", children: /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("h4", { className: "lx-section-title lx-title", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-compass lx-ico lx-text-grad-2" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 958,
        columnNumber: 21
      }),
      "Recommended Courses for you"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 957,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "lx-section-desc lx-muted", children: "Discover new paths in Learn-ix and enroll" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 960,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 956,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 955,
    columnNumber: 9
  }),
  suggested.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-empty lx-empty-compact", children: /* @__PURE__ */ jsxDEV("span", { className: "lx-empty-note lx-muted", children: "You are already enrolled in all available courses! \u{1F389}" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 966,
    columnNumber: 17
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 965,
    columnNumber: 13
  }) : /* @__PURE__ */ jsxDEV("div", { className: "lx-grid lx-grid-suggested", children: suggested.map((scourse, sIdx) => /* @__PURE__ */ jsxDEV(SuggestedCard, { course: scourse, idx: sIdx }, scourse.id, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 973,
    columnNumber: 21
  })) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 971,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 954,
  columnNumber: 5
}), "SuggestedSection");
const DashboardScreen = /* @__PURE__ */ __name(({ user, courses, suggested, stats, isDark, onToggleTheme, cardTabs, onTab, query, onQuery }) => /* @__PURE__ */ jsxDEV("div", { children: [
  /* @__PURE__ */ jsxDEV(HeroCard, { user, stats, isDark, onToggleTheme }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 993,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-grid lx-grid-stats", children: buildStatCards(stats).map((item, idx) => /* @__PURE__ */ jsxDEV(StatCard, { item, idx }, item.label, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 997,
    columnNumber: 17
  })) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 995,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-grid lx-grid-charts", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-anim", style: delayStyle(0.25), children: /* @__PURE__ */ jsxDEV(ProgressPanel, { data: buildChartData(courses) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1003,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1002,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-anim", style: delayStyle(0.35), children: /* @__PURE__ */ jsxDEV(MasteryPanel, { stats }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1006,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1005,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1001,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV(CoursesSection, { courses, query, onQuery, cardTabs, onTab }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1010,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV(SuggestedSection, { suggested }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1011,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 992,
  columnNumber: 5
}), "DashboardScreen");
const CaughtUp = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("div", { className: "lx-center-block", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-avatar-ring lx-ring-pad", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-ring-inner lx-ring-80 lx-grad-cyan-emerald", children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-check-double lx-ring-icon-md" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1019,
    columnNumber: 17
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1018,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1017,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("h4", { className: "lx-section-title lx-title", children: "You're all caught up!" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1022,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("p", { className: "lx-muted", children: "You have no remaining tasks in any of your active courses." }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1023,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1016,
  columnNumber: 5
}), "CaughtUp");
const CalendarScreen = /* @__PURE__ */ __name(({ tasks }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-screen lx-screen-scroll lx-anim", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-screen-head", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "lx-screen-title lx-title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-calendar-days lx-ico lx-text-grad-1" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1032,
          columnNumber: 21
        }),
        "Your Master Timeline"
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1031,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("p", { className: "lx-muted", children: "A sleek overview of all upcoming tasks." }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1034,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1030,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-badge lx-badge-soft-purple", children: [
      tasks.length,
      " Remaining Tasks"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1036,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1029,
    columnNumber: 9
  }),
  tasks.length === 0 ? /* @__PURE__ */ jsxDEV(CaughtUp, {}, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1040,
    columnNumber: 13
  }) : /* @__PURE__ */ jsxDEV("div", { className: "lx-timeline", children: tasks.map((task, idx) => /* @__PURE__ */ jsxDEV(TimelineItem, { task, idx }, idx, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1044,
    columnNumber: 21
  })) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1042,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1028,
  columnNumber: 5
}), "CalendarScreen");
const TrophiesScreen = /* @__PURE__ */ __name(({ user, totalCoins }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-screen lx-anim", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-trophy", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-avatar-ring lx-ring-pad", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-ring-inner lx-ring-100 lx-grad-purple-cyan", children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-award lx-ring-icon-lg" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1056,
    columnNumber: 21
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1055,
    columnNumber: 17
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1054,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("h2", { className: "lx-trophy-title lx-title", children: "Trophies & Badges" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1059,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("p", { className: "lx-trophy-desc lx-muted", children: "Track all your earned certificates, badges, and total LX coins." }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1060,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-trophy-stats", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-trophy-stat", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "lx-trophy-num lx-text-grad-2", children: user.level || 1 }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1065,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-trophy-label lx-muted", children: "Current Level" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1066,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1064,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-trophy-stat", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "lx-trophy-num lx-tone-warning", children: totalCoins }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1069,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-trophy-label lx-muted", children: "Total LX Coins" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1070,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1068,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1063,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1053,
  columnNumber: 9
}) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1052,
  columnNumber: 5
}), "TrophiesScreen");
const PreferencesScreen = /* @__PURE__ */ __name(({ isDark, onToggleTheme }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-card lx-screen lx-anim", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-screen-head", children: /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("h3", { className: "lx-screen-title lx-title", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-sliders lx-ico lx-text-grad-1" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1082,
        columnNumber: 21
      }),
      "Account Preferences"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1081,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "lx-muted", children: "Manage your profile, theme preferences, and platform notifications." }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1084,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1080,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1079,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-pref-grid", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h5", { className: "lx-pref-heading lx-title", children: "Appearance" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1090,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-pref-card", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("span", { className: "lx-pref-card-title lx-title", children: "Theme Mode" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1093,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("span", { className: "lx-pref-card-desc lx-muted", children: "Switch between Light and Dark interface" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1094,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1092,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: onToggleTheme, className: "lx-btn-action lx-btn-wide", children: isDark ? "Light Mode" : "Dark Mode" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1096,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1091,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1089,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h5", { className: "lx-pref-heading lx-title", children: "Account Settings" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1102,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-pref-list", children: [
        /* @__PURE__ */ jsxDEV("a", { href: `${BASE_URL}/user/profile.php`, className: "lx-sidebar-btn lx-pref-link active", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "lx-pref-link-label", children: [
            /* @__PURE__ */ jsxDEV("i", { className: "fa fa-user-circle" }, void 0, false, {
              fileName: "public/local/reactlive/js/esm/src/main.tsx",
              lineNumber: 1106,
              columnNumber: 29
            }),
            " Edit Profile"
          ] }, void 0, true, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1105,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-chevron-right lx-pref-chevron" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1108,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1104,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("a", { href: `${BASE_URL}/user/preferences.php`, className: "lx-sidebar-btn lx-pref-link", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "lx-pref-link-label", children: [
            /* @__PURE__ */ jsxDEV("i", { className: "fa fa-bell" }, void 0, false, {
              fileName: "public/local/reactlive/js/esm/src/main.tsx",
              lineNumber: 1112,
              columnNumber: 29
            }),
            " Notification Preferences"
          ] }, void 0, true, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1111,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-chevron-right lx-pref-chevron" }, void 0, false, {
            fileName: "public/local/reactlive/js/esm/src/main.tsx",
            lineNumber: 1114,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1110,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1103,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1101,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1088,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1078,
  columnNumber: 5
}), "PreferencesScreen");
const LOGOUT_DELAY_MS = 2200;
const getLogoutUrl = /* @__PURE__ */ __name(() => {
  const cfg = window.M && window.M.cfg;
  return cfg ? `${cfg.wwwroot}/login/logout.php?sesskey=${cfg.sesskey}` : `${BASE_URL}/login/logout.php`;
}, "getLogoutUrl");
const LogoutOverlay = /* @__PURE__ */ __name(({ name }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-logout", role: "status", "aria-live": "polite", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-logout-card", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-logout-icon lx-grad-purple-cyan", children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-hand" }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1135,
    columnNumber: 17
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1134,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("h3", { className: "lx-logout-title lx-title", children: [
    "See you soon",
    name ? `, ${name}` : "",
    "!"
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1137,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("p", { className: "lx-logout-text lx-muted", children: "Your progress is saved. Signing you out securely..." }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1140,
    columnNumber: 13
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-logout-bar", children: /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1143,
    columnNumber: 44
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1143,
    columnNumber: 13
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1133,
  columnNumber: 9
}) }, void 0, false, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1132,
  columnNumber: 5
}), "LogoutOverlay");
const Sidebar = /* @__PURE__ */ __name(({ activeScreen, onSelect, onLogout }) => /* @__PURE__ */ jsxDEV("div", { className: "lx-sidebar", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-brand", children: [
    /* @__PURE__ */ jsxDEV("img", { src: LOGO_URL, alt: "Learn-ix Logo", className: "lx-brand-logo" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1155,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("h4", { className: "lx-brand-name lx-text-grad-1", children: "Learn-ix" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1156,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1154,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-sidebar-nav", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      className: `lx-sidebar-btn ${activeScreen === item.id ? "active" : ""}`,
      onClick: () => onSelect(item.id),
      children: [
        /* @__PURE__ */ jsxDEV("i", { className: `fa ${item.icon}` }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1167,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-nav-label", children: item.label }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1168,
          columnNumber: 21
        })
      ]
    },
    item.id,
    true,
    {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1161,
      columnNumber: 17
    }
  )) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1159,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-sidebar-footer", children: /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: onLogout, className: "lx-sidebar-btn lx-sidebar-btn-danger", children: [
    /* @__PURE__ */ jsxDEV("i", { className: "fa fa-right-from-bracket" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1175,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-nav-label", children: "Logout" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1176,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1174,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1173,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1153,
  columnNumber: 5
}), "Sidebar");
const Footer = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("footer", { className: "lx-custom-footer", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "lx-footer-brand", children: [
    /* @__PURE__ */ jsxDEV("img", { src: LOGO_URL, alt: "Learn-ix Logo", className: "lx-footer-logo" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1185,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("span", { className: "lx-footer-copy lx-muted", children: [
      "Learn-ix Interactive \xA9 ",
      (/* @__PURE__ */ new Date()).getFullYear()
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1186,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1184,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("div", { className: "lx-footer-links", children: [
    /* @__PURE__ */ jsxDEV("a", { href: `${BASE_URL}/user/contactsitesupport.php`, children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-headset lx-ico-sm" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1192,
        columnNumber: 17
      }),
      " Support"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1191,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("a", { href: `${BASE_URL}/admin/tool/dataprivacy/summary.php`, children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-shield-halved lx-ico-sm" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1195,
        columnNumber: 17
      }),
      " Privacy Policy"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1194,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("a", { href: "#", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-circle-info lx-ico-sm" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1197,
        columnNumber: 25
      }),
      " Terms of Service"
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1197,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1190,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "public/local/reactlive/js/esm/src/main.tsx",
  lineNumber: 1183,
  columnNumber: 5
}), "Footer");
const LOADING_STEPS = ["Syncing your courses", "Calculating your progress", "Preparing your dashboard"];
const LoadingScreen = /* @__PURE__ */ __name(() => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 750);
    return () => clearInterval(id);
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "lx-loading", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "lx-loader-orb lx-loader-orb-a" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1214,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-loader-orb lx-loader-orb-b" }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1215,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-loader-core", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "lx-loader-rings", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "lx-orbit lx-orbit-1" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1218,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-orbit lx-orbit-2" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1219,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("span", { className: "lx-orbit lx-orbit-3" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1220,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("img", { src: LOGO_URL, alt: "Learn-ix", className: "lx-loader-logo" }, void 0, false, {
          fileName: "public/local/reactlive/js/esm/src/main.tsx",
          lineNumber: 1221,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1217,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("h4", { className: "lx-loader-brand lx-text-grad-1", children: "Learn-ix" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1223,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("span", { className: "lx-loader-step", children: LOADING_STEPS[step] }, step, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1224,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-loader-bar", children: /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1225,
        columnNumber: 48
      }) }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1225,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1216,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1213,
    columnNumber: 9
  });
}, "LoadingScreen");
function StudentDashboard() {
  useDashboardPageClass();
  const { user, courses, suggested, timeline, loading } = useStudentData();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("lx_theme") !== "light");
  const [cardTabs, setCardTabs] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [minDelay, setMinDelay] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = /* @__PURE__ */ __name(() => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    setTimeout(() => {
      window.location.href = getLogoutUrl();
    }, LOGOUT_DELAY_MS);
  }, "handleLogout");
  useEffect(() => {
    const id = setTimeout(() => setMinDelay(false), 1800);
    return () => clearTimeout(id);
  }, []);
  const toggleTheme = /* @__PURE__ */ __name(() => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("lx_theme", next ? "dark" : "light");
  }, "toggleTheme");
  const setCourseTab = /* @__PURE__ */ __name((courseId, tabName) => {
    setCardTabs((prev) => ({ ...prev, [courseId]: tabName }));
  }, "setCourseTab");
  if (loading || minDelay) {
    return /* @__PURE__ */ jsxDEV(LoadingScreen, {}, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1268,
      columnNumber: 16
    }, this);
  }
  const stats = computeStats(courses, user);
  const screens = {
    dashboard: /* @__PURE__ */ jsxDEV(
      DashboardScreen,
      {
        user,
        courses,
        suggested,
        stats,
        isDark,
        onToggleTheme: toggleTheme,
        cardTabs,
        onTab: setCourseTab,
        query: searchQuery,
        onQuery: setSearchQuery
      },
      void 0,
      false,
      {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1275,
        columnNumber: 13
      },
      this
    ),
    calendar: /* @__PURE__ */ jsxDEV(CalendarScreen, { tasks: timeline }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1288,
      columnNumber: 19
    }, this),
    trophies: /* @__PURE__ */ jsxDEV(TrophiesScreen, { user, totalCoins: stats.totalCoins }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1289,
      columnNumber: 19
    }, this),
    preferences: /* @__PURE__ */ jsxDEV(PreferencesScreen, { isDark, onToggleTheme: toggleTheme }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1290,
      columnNumber: 22
    }, this)
  };
  return /* @__PURE__ */ jsxDEV("div", { className: `lx-fullscreen-app ${isDark ? "lx-dark" : ""}`, children: [
    /* @__PURE__ */ jsxDEV(Sidebar, { activeScreen, onSelect: setActiveScreen, onLogout: handleLogout }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1295,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "lx-main-content", children: [
      /* @__PURE__ */ jsxDEV(NeuralCanvas, { isDark }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1298,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-shape-blob-1" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1299,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-shape-blob-2" }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1300,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "lx-scrollable-area", children: /* @__PURE__ */ jsxDEV("div", { className: "lx-screen-enter", children: screens[activeScreen] }, activeScreen, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1303,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1302,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(Footer, {}, void 0, false, {
        fileName: "public/local/reactlive/js/esm/src/main.tsx",
        lineNumber: 1306,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1297,
      columnNumber: 13
    }, this),
    loggingOut && /* @__PURE__ */ jsxDEV(LogoutOverlay, { name: user.firstname || user.fullname }, void 0, false, {
      fileName: "public/local/reactlive/js/esm/src/main.tsx",
      lineNumber: 1309,
      columnNumber: 28
    }, this)
  ] }, void 0, true, {
    fileName: "public/local/reactlive/js/esm/src/main.tsx",
    lineNumber: 1294,
    columnNumber: 9
  }, this);
}
__name(StudentDashboard, "StudentDashboard");
export {
  StudentDashboard as default
};
//# sourceMappingURL=main.dev.js.map
