import React, {useState, useEffect, useRef} from 'react';

type User = {
    fullname: string;
    firstname: string;
    avatar: string;
    coins: number;
    level: number;
    completedActivities: number;
};

type Task = {
    id: number;
    name: string;
    modname: string;
    date: string;
    url: string;
    coursename?: string;
    courseimage?: string;
};

type Course = {
    id: number;
    fullname: string;
    shortname: string;
    courseimage: string;
    doneCount: number;
    todoCount: number;
    doneList: Task[];
    todoList: Task[];
    timeSpent: string;
    enrolledSince: string;
    outcomes: string[];
    coinsEarned: number;
    rewardCoins: number;
    progress: number;
    summary?: string;
    category?: string;
    enrolurl?: string;
};

type ScreenId = 'dashboard' | 'calendar' | 'trophies' | 'preferences';

type Stats = {
    totalCourses: number;
    completedCourses: number;
    activeCourses: number;
    avgProgress: number;
    totalDone: number;
    totalTodo: number;
    totalCoins: number;
};

type StatItem = {
    label: string;
    value: number;
    sub: string;
    icon: string;
    grad: string;
};

type NeuralNode = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
};

const BASE_URL = 'http://learnix.local';
const LOGO_URL = `${BASE_URL}/pluginfile.php/1/core_admin/logocompact/300x300/1793054100/image-removebg-preview.png`;
const REFRESH_MS = 15000;
const NODE_COLORS = ['#8B5CF6', '#06B6D4', '#10B981'];
const PAGE_CLASS = 'lx-dashboard-page';

const EMPTY_USER: User = {
    fullname: '',
    firstname: '',
    avatar: '',
    coins: 0,
    level: 1,
    completedActivities: 0
};

const fallbackCourseImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop'
];

const MOD_ICONS: Record<string, string> = {
    quiz: 'fa-bolt lx-tone-warning',
    assign: 'fa-file-signature lx-tone-info',
    forum: 'fa-comments lx-tone-primary',
    page: 'fa-file-lines lx-tone-success',
    resource: 'fa-file-pdf lx-tone-danger',
    url: 'fa-link lx-tone-info',
    book: 'fa-book-open lx-tone-primary',
    scorm: 'fa-cube lx-tone-warning',
    h5pactivity: 'fa-puzzle-piece lx-tone-success'
};

const NAV_ITEMS: {id: ScreenId; icon: string; label: string}[] = [
    {id: 'dashboard', icon: 'fa-border-all', label: 'Dashboard'},
    {id: 'calendar', icon: 'fa-calendar-days', label: 'Calendar & Timeline'},
    {id: 'trophies', icon: 'fa-award', label: 'Trophies & Badges'},
    {id: 'preferences', icon: 'fa-sliders', label: 'Account Preferences'}
];

const getModIcon = (modname: string) => MOD_ICONS[modname] || 'fa-circle-nodes lx-tone-info';

const delayStyle = (seconds: number) => ({animationDelay: `${seconds}s`});

const stagger = (base: number, idx: number) => delayStyle(base * (idx + 1));

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Good morning, stay creative';
    }
    if (hour < 18) {
        return 'Good afternoon, stay productive';
    }
    return 'Good evening, enjoy your journey';
};

const createNodes = (width: number, height: number): NeuralNode[] => Array.from({length: 45}, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    radius: Math.random() * 2.8 + 2.2,
    color: NODE_COLORS[i % NODE_COLORS.length]
}));

const bounce = (pos: number, vel: number, max: number) => (pos < 0 || pos > max ? -vel : vel);

const stepNode = (n: NeuralNode, width: number, height: number): NeuralNode => {
    const x = n.x + n.vx;
    const y = n.y + n.vy;
    return {...n, x, y, vx: bounce(x, n.vx, width), vy: bounce(y, n.vy, height)};
};

const drawLink = (ctx: CanvasRenderingContext2D, a: NeuralNode, b: NeuralNode, isDark: boolean) => {
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
};

const drawNode = (ctx: CanvasRenderingContext2D, n: NeuralNode) => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = n.color;
    ctx.stroke();
};

const normalizeCourse = (c: any, idx: number): Course => ({
    ...c,
    shortname: c.shortname || `CRS-${c.id}`,
    courseimage: c.courseimage || fallbackCourseImages[idx % fallbackCourseImages.length],
    doneCount: c.done_count || (c.done_list ? c.done_list.length : 0),
    todoCount: c.todo_count || (c.todo_list ? c.todo_list.length : 0),
    doneList: c.done_list || [],
    todoList: c.todo_list || [],
    timeSpent: c.time_spent || '0h 0m',
    enrolledSince: c.enrolled_since || '-',
    outcomes: c.outcomes || [
        `Master core concepts of ${c.fullname}`,
        'Complete interactive milestones & practical tasks',
        'Achieve target grade benchmark'
    ],
    coinsEarned: (c.progress || 0) * 5,
    rewardCoins: c.reward_coins || 0
});

const parseResponse = (response: any) => {
    if (Array.isArray(response)) {
        return {user: null, courses: response, suggested: null};
    }
    if (!response || typeof response !== 'object') {
        return {user: null, courses: [], suggested: null};
    }
    return {
        user: response.user
            ? {...response.user, completedActivities: response.user.completed_activities}
            : null,
        courses: Array.isArray(response.courses) ? response.courses : [],
        suggested: Array.isArray(response.suggested) ? response.suggested : null
    };
};

const buildTimeline = (courses: Course[]): Task[] => courses.flatMap(course =>
    course.todoList.map(task => ({
        ...task,
        coursename: course.fullname,
        courseimage: course.courseimage
    }))
);

const computeStats = (courses: Course[], user: User): Stats => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
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
        totalCoins: user.coins || (totalDone * 25 + completedCourses * 150 + totalCourses * 50)
    };
};

const buildStatCards = (stats: Stats): StatItem[] => [
    {
        label: 'Total Enrolled Courses',
        value: stats.totalCourses,
        sub: `${stats.activeCourses} currently active`,
        icon: 'fa-layer-group',
        grad: 'lx-grad-purple-cyan'
    },
    {
        label: 'Completed Activities (Done)',
        value: stats.totalDone,
        sub: '+25 LX Coin per activity',
        icon: 'fa-circle-check',
        grad: 'lx-grad-cyan-emerald'
    },
    {
        label: 'Remaining Activities (To-Do)',
        value: stats.totalTodo,
        sub: 'Pending tasks',
        icon: 'fa-hourglass-half',
        grad: 'lx-grad-purple-cyan'
    },
    {
        label: '100% Completed Courses',
        value: stats.completedCourses,
        sub: 'Certificates and achieved outcomes',
        icon: 'fa-trophy',
        grad: 'lx-grad-cyan-emerald'
    }
];

const buildChartData = (courses: Course[]) => courses.map(c => ({
    name: c.fullname.length > 14 ? `${c.fullname.substring(0, 14)}...` : c.fullname,
    progress: c.progress,
    done: c.doneCount,
    todo: c.todoCount
}));

const loadAjax = (attempt = 0): Promise<any> => new Promise<any>((resolve, reject) => {
    (window as any).require(['core/ajax'], resolve, reject);
}).catch(err => (attempt < 2 ? loadAjax(attempt + 1) : Promise.reject(err)));

const callService = (methodname: string, args: Record<string, unknown>) => loadAjax()
    .then(moodleAjax => moodleAjax.call([{methodname, args}])[0]);

const useDashboardPageClass = () => {
    useEffect(() => {
        document.body.classList.add(PAGE_CLASS);
        return () => {
            document.body.classList.remove(PAGE_CLASS);
        };
    }, []);
};

const useCountUp = (target: number, duration = 1100) => {
    const [value, setValue] = useState(0);
    const fromRef = useRef(0);

    useEffect(() => {
        const from = fromRef.current;
        const start = performance.now();
        let frameId = 0;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const next = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
            fromRef.current = next;
            setValue(next);
            if (t < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };
        frameId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return value;
};

const CountUp = ({value, suffix = ''}: {value: number; suffix?: string}) => {
    const current = useCountUp(value);
    return <>{current}{suffix}</>;
};

const useStudentData = () => {
    const [user, setUser] = useState<User>(EMPTY_USER);
    const [courses, setCourses] = useState<Course[]>([]);
    const [suggested, setSuggested] = useState<Course[]>([]);
    const [timeline, setTimeline] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const applyResponse = (response: any) => {
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
        };

        const load = async() => {
            const response = await callService('local_reactlive_get_student_data', {});
            applyResponse(response);
        };

        const fetchData = () => load()
            .catch(err => {
                console.error('reactlive: failed to load student data', err);
                return null;
            })
            .finally(() => setLoading(false));

        fetchData();
        const intervalId = setInterval(fetchData, REFRESH_MS);
        return () => clearInterval(intervalId);
    }, []);

    return {user, courses, suggested, timeline, loading};
};

const NeuralCanvas = ({isDark}: {isDark: boolean}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas ? canvas.getContext('2d') : null;
        if (!canvas || !canvas.parentElement || !ctx) {
            return undefined;
        }
        const parent = canvas.parentElement;
        let frameId = 0;

        const resize = () => {
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let nodes = createNodes(canvas.width, canvas.height);

        const render = () => {
            nodes = nodes.map(n => stepNode(n, canvas.width, canvas.height));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nodes.forEach((n1, i) => {
                nodes.slice(i + 1).forEach(n2 => drawLink(ctx, n1, n2, isDark));
                drawNode(ctx, n1);
            });
            frameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
        };
    }, [isDark]);

    return <canvas ref={canvasRef} className="lx-canvas-bg" />;
};

const StatCard = ({item, idx}: {item: StatItem; idx: number}) => (
    <div className="lx-anim" style={stagger(0.08, idx)}>
        <div className="lx-card lx-card-interactive lx-stat">
            <div>
                <span className="lx-stat-label lx-muted">{item.label}</span>
                <h2 className="lx-stat-value lx-title"><CountUp value={item.value} /></h2>
                <span className="lx-stat-sub lx-text-grad-2">{item.sub}</span>
            </div>
            <div className={`lx-stat-icon ${item.grad}`}>
                <i className={`fa ${item.icon}`}></i>
            </div>
        </div>
    </div>
);

const TimelineItem = ({task, idx}: {task: Task; idx: number}) => (
    <div className="lx-timeline-item lx-anim" style={stagger(0.1, idx)}>
        <div className="lx-timeline-dot"></div>
        <div className="lx-timeline-content">
            <div className="lx-tl-row">
                <div className="lx-tl-main">
                    <img src={task.courseimage} alt="course" className="lx-tl-thumb" />
                    <div>
                        <h5 className="lx-tl-title lx-title">
                            <i className={`fa ${getModIcon(task.modname)}`}></i>
                            {task.name}
                        </h5>
                        <span className="lx-tl-course lx-muted">
                            Course: <span className="lx-text-grad-2"> {task.coursename}</span>
                        </span>
                    </div>
                </div>
                <div className="lx-tl-side">
                    <span className="lx-badge lx-badge-due">
                        <i className="fa fa-clock"></i> Due: {task.date}
                    </span>
                    <a href={task.url} className="lx-btn-action lx-btn-small">
                        Open Task <i className="fa fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const CourseBanner = ({course}: {course: Course}) => (
    <div className="lx-course-banner">
        <img src={course.courseimage} alt={course.fullname} />
        <div className="lx-banner-overlay">
            <div className="lx-banner-top">
                <span className="lx-badge lx-badge-code">
                    <i className="fa fa-cube"></i>
                    {course.shortname}
                </span>
                <span className="lx-badge lx-grad-cyan-emerald">
                    <i className="fa fa-coins"></i>
                    +{course.coinsEarned} LX
                </span>
            </div>
            <h5 className="lx-banner-title" title={course.fullname}>
                {course.fullname}
            </h5>
        </div>
    </div>
);

const MiniStat = ({label, value, icon, tone}: {label: string; value: string | number; icon?: string; tone: string}) => (
    <div className="lx-mini-stat">
        <span className="lx-mini-label lx-muted">{label}</span>
        <span className={`lx-mini-value ${tone}`}>
            {icon && <i className={`fa ${icon} lx-ico-sm`}></i>}
            {value}
        </span>
    </div>
);

const CourseStats = ({course}: {course: Course}) => (
    <div className="lx-mini-grid">
        <MiniStat label="Enrolled" value={course.enrolledSince} tone="lx-title" />
        <MiniStat label="Time Spent" value={course.timeSpent} icon="fa-stopwatch" tone="lx-tone-warning" />
        <MiniStat label="Completed" value={course.doneCount} icon="fa-check-circle" tone="lx-tone-success" />
        <MiniStat label="Remaining" value={course.todoCount} icon="fa-clock" tone="lx-tone-info" />
    </div>
);

const CourseProgress = ({progress}: {progress: number}) => {
    const gradClass = progress === 100 ? 'lx-grad-cyan-emerald' : 'lx-grad-purple-cyan';
    return (
        <div className="lx-progress-wrap">
            <div className="lx-progress-head">
                <span className="lx-progress-label lx-muted">Course Completion</span>
                <span className="lx-progress-value lx-text-grad-2">{progress}%</span>
            </div>
            <div className="lx-progress-track">
                <div className={`lx-progress-bar ${gradClass}`} style={{width: `${progress}%`}}></div>
            </div>
        </div>
    );
};

const CourseTabs = ({course, activeTab, onSelect}: {course: Course; activeTab: string; onSelect: (tab: string) => void}) => {
    const tabs = [
        {id: 'outcomes', icon: 'fa-bullseye', label: 'Outcomes'},
        {id: 'done', icon: 'fa-check', label: `(${course.doneCount})`},
        {id: 'todo', icon: 'fa-list-check', label: `(${course.todoCount})`}
    ];
    return (
        <div className="lx-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    className={`lx-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onSelect(tab.id)}
                >
                    <i className={`fa ${tab.icon} lx-ico-sm`}></i>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

const OutcomeList = ({items}: {items: string[]}) => (
    <div>
        {items.map((out, oIdx) => (
            <div className="lx-activity-item lx-outcome" key={oIdx}>
                <i className="fa fa-gem lx-text-grad-1"></i>
                <span className="lx-outcome-text lx-title">{out}</span>
            </div>
        ))}
    </div>
);

const ActivityRow = ({act, children}: {act: Task; children: React.ReactNode}) => (
    <a href={act.url} className="lx-activity-item">
        <div className="lx-activity-main">
            <i className={`fa ${getModIcon(act.modname)}`}></i>
            <span className="lx-activity-name lx-title">{act.name}</span>
        </div>
        <div className="lx-activity-meta">{children}</div>
    </a>
);

const DoneList = ({items}: {items: Task[]}) => {
    if (items.length === 0) {
        return (
            <div className="lx-activity-empty lx-muted">
                You haven't completed any activities in this course yet.
            </div>
        );
    }
    return (
        <div>
            {items.map(act => (
                <ActivityRow key={act.id} act={act}>
                    <span className="lx-activity-date lx-muted lx-hide-sm">{act.date}</span>
                    <span className="lx-badge lx-badge-done">+25 LX</span>
                </ActivityRow>
            ))}
        </div>
    );
};

const TodoList = ({items}: {items: Task[]}) => {
    if (items.length === 0) {
        return (
            <div className="lx-activity-empty lx-tone-success">
                <i className="fa fa-party-horn lx-ico-sm"></i> Awesome! All done.
            </div>
        );
    }
    return (
        <div>
            {items.map(act => (
                <ActivityRow key={act.id} act={act}>
                    <div className="lx-due lx-hide-sm">
                        <span className="lx-due-label lx-muted">Due Date</span>
                        <span className="lx-due-date">{act.date}</span>
                    </div>
                    <span className="lx-badge lx-badge-start">
                        Start <i className="fa fa-arrow-right"></i>
                    </span>
                </ActivityRow>
            ))}
        </div>
    );
};

const CourseTabBody = ({course, activeTab}: {course: Course; activeTab: string}) => {
    if (activeTab === 'done') {
        return <DoneList items={course.doneList} />;
    }
    if (activeTab === 'todo') {
        return <TodoList items={course.todoList} />;
    }
    return <OutcomeList items={course.outcomes} />;
};

const CourseFooter = ({course}: {course: Course}) => {
    const isCompleted = course.progress === 100;
    const view = isCompleted
        ? {note: 'Fully Completed', cta: 'Review Course', icon: 'fa-award', btn: 'lx-btn-emerald'}
        : {note: `${100 - course.progress}% remaining`, cta: 'Continue Learning', icon: 'fa-rocket', btn: ''};
    return (
        <div className="lx-course-foot">
            <span className="lx-course-foot-note lx-muted">
                <i className="fa fa-shield-halved lx-tone-info lx-ico-sm"></i>
                {view.note}
            </span>
            <a href={`/course/view.php?id=${course.id}`} className={`lx-btn-action ${view.btn}`}>
                {view.cta}
                <i className={`fa ${view.icon}`}></i>
            </a>
        </div>
    );
};

const CourseCard = ({course, idx, activeTab, setCourseTab}: {
    course: Course;
    idx: number;
    activeTab: string;
    setCourseTab: (id: number, tab: string) => void;
}) => (
    <div className="lx-anim" style={stagger(0.1, idx)}>
        <div className="lx-card lx-card-interactive lx-course">
            <CourseBanner course={course} />
            <div className="lx-course-body">
                <CourseStats course={course} />
                <CourseProgress progress={course.progress} />
                <CourseTabs course={course} activeTab={activeTab} onSelect={tab => setCourseTab(course.id, tab)} />
                <div className="lx-scroll-box">
                    <CourseTabBody course={course} activeTab={activeTab} />
                </div>
                <CourseFooter course={course} />
            </div>
        </div>
    </div>
);

const SuggestedCard = ({course, idx}: {course: Course; idx: number}) => {
    const image = course.courseimage || fallbackCourseImages[(idx + 2) % fallbackCourseImages.length];
    return (
        <div className="lx-anim" style={stagger(0.1, idx)}>
            <div className="lx-card lx-card-interactive lx-course">
                <div className="lx-course-banner lx-course-banner-short">
                    <img src={image} alt={course.fullname} />
                    <div className="lx-banner-overlay">
                        <div className="lx-banner-top">
                            <span className="lx-badge lx-badge-compact lx-badge-category">{course.category}</span>
                            <span className="lx-badge lx-badge-compact lx-grad-cyan-emerald">
                                <i className="fa fa-gift"></i> +{course.rewardCoins} LX Coins
                            </span>
                        </div>
                    </div>
                </div>
                <div className="lx-course-body">
                    <h5 className="lx-suggest-title lx-title">{course.fullname}</h5>
                    <p className="lx-suggest-summary lx-muted">{course.summary}</p>
                    <div className="lx-course-foot">
                        <span className="lx-suggest-avail lx-text-grad-1">
                            <i className="fa fa-unlock-keyhole lx-ico-sm"></i> Available for Enrollment
                        </span>
                        <a href={course.enrolurl} className="lx-btn-action lx-btn-emerald">
                            Try and Enroll Now <i className="fa fa-plus-circle"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Avatar = ({user}: {user: User}) => (
    <div className="lx-avatar-ring">
        {user.avatar ? (
            <img src={user.avatar} alt={user.fullname} className="lx-avatar-img" />
        ) : (
            <div className="lx-avatar-img lx-avatar-fallback lx-grad-purple-cyan">
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'S'}
            </div>
        )}
    </div>
);

const CoinPill = ({icon, grad, label, children}: {icon: string; grad: string; label: string; children: React.ReactNode}) => (
    <div className="lx-coin-pill">
        <div className={`lx-coin-icon ${grad}`}>
            <i className={`fa ${icon}`}></i>
        </div>
        <div>
            <span className="lx-coin-label lx-muted">{label}</span>
            <span className="lx-coin-value lx-title">{children}</span>
        </div>
    </div>
);

const HeroCard = ({user, stats, isDark, onToggleTheme}: {
    user: User;
    stats: Stats;
    isDark: boolean;
    onToggleTheme: () => void;
}) => (
    <div className="lx-card lx-hero lx-anim">
        <div className="lx-hero-user">
            <Avatar user={user} />
            <div>
                <div className="lx-hero-meta">
                    <span className="lx-badge lx-badge-compact lx-grad-purple-cyan">
                        <i className="fa fa-sparkles"></i> Level {user.level || 1} Explorer
                    </span>
                    <span className="lx-hero-sub lx-muted">Interactive Experience</span>
                </div>
                <h3 className="lx-hero-title lx-title">
                    {getGreeting()}, <span className="lx-text-grad-2">{user.fullname}</span> 👋
                </h3>
                <p className="lx-hero-text lx-muted">
                    You have completed <strong className="lx-text-grad-1">{stats.totalDone}</strong>
                    {' '}learning tasks and you have <strong>{stats.totalTodo} tasks</strong> left!
                </p>
            </div>
        </div>
        <div className="lx-hero-actions">
            <CoinPill icon="fa-coins" grad="lx-grad-cyan-emerald" label="Platform Coins Balance">
                <CountUp value={stats.totalCoins} /> <small className="lx-coin-unit lx-text-grad-2">LX Coins</small>
            </CoinPill>
            <CoinPill icon="fa-fire" grad="lx-grad-purple-cyan" label="Overall Completion Rate">
                <CountUp value={stats.avgProgress} suffix="%" />
            </CoinPill>
            <button
                type="button"
                onClick={onToggleTheme}
                className="lx-theme-toggle"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                <i className={`fa ${isDark ? 'fa-sun lx-tone-warning' : 'fa-moon lx-tone-primary'}`}></i>
            </button>
        </div>
    </div>
);

type ChartPoint = {
    name: string;
    progress: number;
};

type XY = {
    x: number;
    y: number;
};

const CHART_W = 600;
const CHART_H = 250;
const CHART_PAD = {left: 36, right: 16, top: 12, bottom: 28};
const CHART_TICKS = [0, 25, 50, 75, 100];
const DONUT_R = 71;
const DONUT_LEN = 2 * Math.PI * DONUT_R;

const smoothPath = (pts: XY[]) => pts.reduce((acc, p, i) => {
    if (i === 0) {
        return `M ${p.x} ${p.y}`;
    }
    const prev = pts[i - 1];
    const mid = (prev.x + p.x) / 2;
    return `${acc} C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`;
}, '');

const AreaChartSvg = ({data}: {data: ChartPoint[]}) => {
    const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
    const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
    const baseY = CHART_PAD.top + innerH;
    const yFor = (value: number) => CHART_PAD.top + innerH * (1 - Math.min(100, Math.max(0, value)) / 100);
    const points = data.map((d, i) => ({
        ...d,
        x: data.length > 1 ? CHART_PAD.left + (innerW / (data.length - 1)) * i : CHART_PAD.left + innerW / 2,
        y: yFor(d.progress)
    }));
    const line: XY[] = points.length === 1
        ? [{x: CHART_PAD.left, y: points[0].y}, {x: CHART_PAD.left + innerW, y: points[0].y}]
        : points;
    const linePath = smoothPath(line);
    const areaPath = line.length > 0
        ? `${linePath} L ${line[line.length - 1].x} ${baseY} L ${line[0].x} ${baseY} Z`
        : '';

    return (
        <svg className="lx-chart-svg" viewBox={`0 0 ${CHART_W} ${CHART_H}`} role="img">
            <defs>
                <linearGradient id="lxAreaGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" className="lx-stop-purple" />
                    <stop offset="50%" className="lx-stop-cyan" />
                    <stop offset="100%" className="lx-stop-emerald" />
                </linearGradient>
            </defs>
            {CHART_TICKS.map(tick => (
                <g key={tick}>
                    <line
                        className="lx-chart-grid"
                        x1={CHART_PAD.left}
                        x2={CHART_W - CHART_PAD.right}
                        y1={yFor(tick)}
                        y2={yFor(tick)}
                    />
                    <text className="lx-chart-label" x={CHART_PAD.left - 8} y={yFor(tick) + 4} textAnchor="end">
                        {tick}
                    </text>
                </g>
            ))}
            {areaPath && <path className="lx-chart-area" d={areaPath} />}
            {linePath && <path className="lx-chart-line" d={linePath} pathLength={1} />}
            {points.map((p, i) => (
                <g key={i}>
                    <circle className="lx-chart-dot" cx={p.x} cy={p.y} r={5} style={delayStyle(0.7 + i * 0.12)}>
                        <title>{`${p.name}: ${p.progress}%`}</title>
                    </circle>
                    <text className="lx-chart-label" x={p.x} y={CHART_H - 8} textAnchor="middle">
                        {p.name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

const DonutChart = ({value}: {value: number}) => {
    const filled = (Math.min(100, Math.max(0, value)) / 100) * DONUT_LEN;
    return (
        <svg className="lx-donut-svg" viewBox="0 0 200 200" role="img">
            <circle className="lx-donut-track" cx="100" cy="100" r={DONUT_R} />
            {filled > 0 && (
                <circle
                    className="lx-donut-arc"
                    cx="100"
                    cy="100"
                    r={DONUT_R}
                    strokeDasharray={`${filled} ${DONUT_LEN}`}
                    transform="rotate(-90 100 100)"
                />
            )}
        </svg>
    );
};

const ProgressPanel = ({data}: {data: ChartPoint[]}) => (
    <div className="lx-card lx-panel">
        <div className="lx-panel-head">
            <div>
                <h5 className="lx-panel-title lx-title">
                    <i className="fa fa-chart-line lx-ico lx-text-grad-1"></i>
                    Progress Analysis & Task Comparison
                </h5>
                <p className="lx-panel-desc lx-muted">
                    Live tracking of completion rates in each enrolled course
                </p>
            </div>
            <span className="lx-badge lx-badge-due">
                <i className="fa fa-rotate fa-spin"></i> Live Sync
            </span>
        </div>
        <div className="lx-chart-box">
            <AreaChartSvg data={data} />
        </div>
    </div>
);

const MasteryPanel = ({stats}: {stats: Stats}) => (
    <div className="lx-card lx-panel lx-panel-col">
        <div>
            <h5 className="lx-panel-title lx-title">
                <i className="fa fa-bullseye lx-ico lx-text-grad-2"></i>Overall Mastery Index
            </h5>
            <p className="lx-panel-desc lx-muted">Percentage of achieved learning outcomes</p>
        </div>
        <div className="lx-donut-box">
            <DonutChart value={stats.avgProgress} />
            <div className="lx-donut-center">
                <h2 className="lx-donut-value lx-text-grad-2"><CountUp value={stats.avgProgress} suffix="%" /></h2>
                <span className="lx-donut-label lx-muted">Overall Mastery</span>
            </div>
        </div>
        <div className="lx-mastery-foot">
            <div>
                <span className="lx-mastery-label lx-muted">Completed</span>
                <span className="lx-mastery-value lx-tone-success">
                    <i className="fa fa-check lx-ico-sm"></i>{stats.totalDone} activities
                </span>
            </div>
            <div>
                <span className="lx-mastery-label lx-muted">Remaining</span>
                <span className="lx-mastery-value lx-tone-info">
                    <i className="fa fa-clock lx-ico-sm"></i>{stats.totalTodo} activities
                </span>
            </div>
        </div>
    </div>
);

const CoursesSection = ({courses, query, onQuery, cardTabs, onTab}: {
    courses: Course[];
    query: string;
    onQuery: (value: string) => void;
    cardTabs: Record<number, string>;
    onTab: (id: number, tab: string) => void;
}) => {
    const filtered = courses.filter(c => c.fullname.toLowerCase().includes(query.toLowerCase()));
    return (
        <>
            <div className="lx-section-head">
                <div>
                    <h4 className="lx-section-title lx-title">
                        <i className="fa fa-graduation-cap lx-ico lx-text-grad-1"></i>
                        My Courses, Progress Details
                    </h4>
                    <p className="lx-section-desc lx-muted">Browse each course's outcomes and tasks</p>
                </div>
                <div className="lx-search">
                    <i className="fa fa-search lx-search-icon lx-muted"></i>
                    <input
                        type="text"
                        className="lx-search-input"
                        placeholder="Search your courses..."
                        value={query}
                        onChange={e => onQuery(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="lx-card lx-empty">
                    <i className="fa fa-folder-open lx-empty-icon lx-text-grad-1"></i>
                    <h5 className="lx-empty-title lx-title">No matching courses found</h5>
                    <p className="lx-muted">Explore suggested courses below and start learning now!</p>
                </div>
            ) : (
                <div className="lx-grid lx-grid-courses">
                    {filtered.map((course, idx) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            idx={idx}
                            activeTab={cardTabs[course.id] || 'outcomes'}
                            setCourseTab={onTab}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const SuggestedSection = ({suggested}: {suggested: Course[]}) => (
    <>
        <div className="lx-section-head">
            <div>
                <h4 className="lx-section-title lx-title">
                    <i className="fa fa-compass lx-ico lx-text-grad-2"></i>Recommended Courses for you
                </h4>
                <p className="lx-section-desc lx-muted">Discover new paths in Learn-ix and enroll</p>
            </div>
        </div>

        {suggested.length === 0 ? (
            <div className="lx-card lx-empty lx-empty-compact">
                <span className="lx-empty-note lx-muted">
                    You are already enrolled in all available courses! 🎉
                </span>
            </div>
        ) : (
            <div className="lx-grid lx-grid-suggested">
                {suggested.map((scourse, sIdx) => (
                    <SuggestedCard key={scourse.id} course={scourse} idx={sIdx} />
                ))}
            </div>
        )}
    </>
);

const DashboardScreen = ({user, courses, suggested, stats, isDark, onToggleTheme, cardTabs, onTab, query, onQuery}: {
    user: User;
    courses: Course[];
    suggested: Course[];
    stats: Stats;
    isDark: boolean;
    onToggleTheme: () => void;
    cardTabs: Record<number, string>;
    onTab: (id: number, tab: string) => void;
    query: string;
    onQuery: (value: string) => void;
}) => (
    <div>
        <HeroCard user={user} stats={stats} isDark={isDark} onToggleTheme={onToggleTheme} />

        <div className="lx-grid lx-grid-stats">
            {buildStatCards(stats).map((item, idx) => (
                <StatCard key={item.label} item={item} idx={idx} />
            ))}
        </div>

        <div className="lx-grid lx-grid-charts">
            <div className="lx-anim" style={delayStyle(0.25)}>
                <ProgressPanel data={buildChartData(courses)} />
            </div>
            <div className="lx-anim" style={delayStyle(0.35)}>
                <MasteryPanel stats={stats} />
            </div>
        </div>

        <CoursesSection courses={courses} query={query} onQuery={onQuery} cardTabs={cardTabs} onTab={onTab} />
        <SuggestedSection suggested={suggested} />
    </div>
);

const CaughtUp = () => (
    <div className="lx-center-block">
        <div className="lx-avatar-ring lx-ring-pad">
            <div className="lx-ring-inner lx-ring-80 lx-grad-cyan-emerald">
                <i className="fa fa-check-double lx-ring-icon-md"></i>
            </div>
        </div>
        <h4 className="lx-section-title lx-title">You're all caught up!</h4>
        <p className="lx-muted">You have no remaining tasks in any of your active courses.</p>
    </div>
);

const CalendarScreen = ({tasks}: {tasks: Task[]}) => (
    <div className="lx-card lx-screen lx-screen-scroll lx-anim">
        <div className="lx-screen-head">
            <div>
                <h3 className="lx-screen-title lx-title">
                    <i className="fa fa-calendar-days lx-ico lx-text-grad-1"></i>Your Master Timeline
                </h3>
                <p className="lx-muted">A sleek overview of all upcoming tasks.</p>
            </div>
            <span className="lx-badge lx-badge-soft-purple">{tasks.length} Remaining Tasks</span>
        </div>

        {tasks.length === 0 ? (
            <CaughtUp />
        ) : (
            <div className="lx-timeline">
                {tasks.map((task, idx) => (
                    <TimelineItem key={idx} task={task} idx={idx} />
                ))}
            </div>
        )}
    </div>
);

const TrophiesScreen = ({user, totalCoins}: {user: User; totalCoins: number}) => (
    <div className="lx-card lx-screen lx-anim">
        <div className="lx-trophy">
            <div className="lx-avatar-ring lx-ring-pad">
                <div className="lx-ring-inner lx-ring-100 lx-grad-purple-cyan">
                    <i className="fa fa-award lx-ring-icon-lg"></i>
                </div>
            </div>
            <h2 className="lx-trophy-title lx-title">Trophies & Badges</h2>
            <p className="lx-trophy-desc lx-muted">
                Track all your earned certificates, badges, and total LX coins.
            </p>
            <div className="lx-trophy-stats">
                <div className="lx-trophy-stat">
                    <h3 className="lx-trophy-num lx-text-grad-2">{user.level || 1}</h3>
                    <span className="lx-trophy-label lx-muted">Current Level</span>
                </div>
                <div className="lx-trophy-stat">
                    <h3 className="lx-trophy-num lx-tone-warning">{totalCoins}</h3>
                    <span className="lx-trophy-label lx-muted">Total LX Coins</span>
                </div>
            </div>
        </div>
    </div>
);

const PreferencesScreen = ({isDark, onToggleTheme}: {isDark: boolean; onToggleTheme: () => void}) => (
    <div className="lx-card lx-screen lx-anim">
        <div className="lx-screen-head">
            <div>
                <h3 className="lx-screen-title lx-title">
                    <i className="fa fa-sliders lx-ico lx-text-grad-1"></i>Account Preferences
                </h3>
                <p className="lx-muted">Manage your profile, theme preferences, and platform notifications.</p>
            </div>
        </div>

        <div className="lx-pref-grid">
            <div>
                <h5 className="lx-pref-heading lx-title">Appearance</h5>
                <div className="lx-pref-card">
                    <div>
                        <span className="lx-pref-card-title lx-title">Theme Mode</span>
                        <span className="lx-pref-card-desc lx-muted">Switch between Light and Dark interface</span>
                    </div>
                    <button type="button" onClick={onToggleTheme} className="lx-btn-action lx-btn-wide">
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </div>
            <div>
                <h5 className="lx-pref-heading lx-title">Account Settings</h5>
                <div className="lx-pref-list">
                    <a href={`${BASE_URL}/user/profile.php`} className="lx-sidebar-btn lx-pref-link active">
                        <span className="lx-pref-link-label">
                            <i className="fa fa-user-circle"></i> Edit Profile
                        </span>
                        <i className="fa fa-chevron-right lx-pref-chevron"></i>
                    </a>
                    <a href={`${BASE_URL}/user/preferences.php`} className="lx-sidebar-btn lx-pref-link">
                        <span className="lx-pref-link-label">
                            <i className="fa fa-bell"></i> Notification Preferences
                        </span>
                        <i className="fa fa-chevron-right lx-pref-chevron"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

const LOGOUT_DELAY_MS = 2200;

const getLogoutUrl = () => {
    const cfg = (window as any).M && (window as any).M.cfg;
    return cfg
        ? `${cfg.wwwroot}/login/logout.php?sesskey=${cfg.sesskey}`
        : `${BASE_URL}/login/logout.php`;
};

const LogoutOverlay = ({name}: {name: string}) => (
    <div className="lx-logout" role="status" aria-live="polite">
        <div className="lx-logout-card">
            <div className="lx-logout-icon lx-grad-purple-cyan">
                <i className="fa fa-hand"></i>
            </div>
            <h3 className="lx-logout-title lx-title">
                See you soon{name ? `, ${name}` : ''}!
            </h3>
            <p className="lx-logout-text lx-muted">
                Your progress is saved. Signing you out securely...
            </p>
            <div className="lx-logout-bar"><span></span></div>
        </div>
    </div>
);

const Sidebar = ({activeScreen, onSelect, onLogout}: {
    activeScreen: ScreenId;
    onSelect: (id: ScreenId) => void;
    onLogout: () => void;
}) => (
    <div className="lx-sidebar">
        <div className="lx-brand">
            <img src={LOGO_URL} alt="Learn-ix Logo" className="lx-brand-logo" />
            <h4 className="lx-brand-name lx-text-grad-1">Learn-ix</h4>
        </div>

        <div className="lx-sidebar-nav">
            {NAV_ITEMS.map(item => (
                <button
                    key={item.id}
                    type="button"
                    className={`lx-sidebar-btn ${activeScreen === item.id ? 'active' : ''}`}
                    onClick={() => onSelect(item.id)}
                >
                    <i className={`fa ${item.icon}`}></i>
                    <span className="lx-nav-label">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="lx-sidebar-footer">
            <button type="button" onClick={onLogout} className="lx-sidebar-btn lx-sidebar-btn-danger">
                <i className="fa fa-right-from-bracket"></i>
                <span className="lx-nav-label">Logout</span>
            </button>
        </div>
    </div>
);

const Footer = () => (
    <footer className="lx-custom-footer">
        <div className="lx-footer-brand">
            <img src={LOGO_URL} alt="Learn-ix Logo" className="lx-footer-logo" />
            <span className="lx-footer-copy lx-muted">
                Learn-ix Interactive © {new Date().getFullYear()}
            </span>
        </div>
        <div className="lx-footer-links">
            <a href={`${BASE_URL}/user/contactsitesupport.php`}>
                <i className="fa fa-headset lx-ico-sm"></i> Support
            </a>
            <a href={`${BASE_URL}/admin/tool/dataprivacy/summary.php`}>
                <i className="fa fa-shield-halved lx-ico-sm"></i> Privacy Policy
            </a>
            <a href="#"><i className="fa fa-circle-info lx-ico-sm"></i> Terms of Service</a>
        </div>
    </footer>
);

const LOADING_STEPS = ['Syncing your courses', 'Calculating your progress', 'Preparing your dashboard'];

const LoadingScreen = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 750);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="lx-loading" role="status" aria-live="polite">
            <div className="lx-loader-orb lx-loader-orb-a"></div>
            <div className="lx-loader-orb lx-loader-orb-b"></div>
            <div className="lx-loader-core">
                <div className="lx-loader-rings">
                    <span className="lx-orbit lx-orbit-1"></span>
                    <span className="lx-orbit lx-orbit-2"></span>
                    <span className="lx-orbit lx-orbit-3"></span>
                    <img src={LOGO_URL} alt="Learn-ix" className="lx-loader-logo" />
                </div>
                <h4 className="lx-loader-brand lx-text-grad-1">Learn-ix</h4>
                <span key={step} className="lx-loader-step">{LOADING_STEPS[step]}</span>
                <div className="lx-loader-bar"><span></span></div>
            </div>
        </div>
    );
};

export default function StudentDashboard() {
    useDashboardPageClass();

    const {user, courses, suggested, timeline, loading} = useStudentData();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('lx_theme') !== 'light');
    const [cardTabs, setCardTabs] = useState<Record<number, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
    const [minDelay, setMinDelay] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        if (loggingOut) {
            return;
        }
        setLoggingOut(true);
        setTimeout(() => {
            window.location.href = getLogoutUrl();
        }, LOGOUT_DELAY_MS);
    };

    useEffect(() => {
        const id = setTimeout(() => setMinDelay(false), 1800);
        return () => clearTimeout(id);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('lx_theme', next ? 'dark' : 'light');
    };

    const setCourseTab = (courseId: number, tabName: string) => {
        setCardTabs(prev => ({...prev, [courseId]: tabName}));
    };

    if (loading || minDelay) {
        return <LoadingScreen />;
    }

    const stats = computeStats(courses, user);

    const screens: Record<ScreenId, React.ReactNode> = {
        dashboard: (
            <DashboardScreen
                user={user}
                courses={courses}
                suggested={suggested}
                stats={stats}
                isDark={isDark}
                onToggleTheme={toggleTheme}
                cardTabs={cardTabs}
                onTab={setCourseTab}
                query={searchQuery}
                onQuery={setSearchQuery}
            />
        ),
        calendar: <CalendarScreen tasks={timeline} />,
        trophies: <TrophiesScreen user={user} totalCoins={stats.totalCoins} />,
        preferences: <PreferencesScreen isDark={isDark} onToggleTheme={toggleTheme} />
    };

    return (
        <div className={`lx-fullscreen-app ${isDark ? 'lx-dark' : ''}`}>
            <Sidebar activeScreen={activeScreen} onSelect={setActiveScreen} onLogout={handleLogout} />

            <div className="lx-main-content">
                <NeuralCanvas isDark={isDark} />
                <div className="lx-shape-blob-1"></div>
                <div className="lx-shape-blob-2"></div>

                <div className="lx-scrollable-area">
                    <div key={activeScreen} className="lx-screen-enter">{screens[activeScreen]}</div>
                </div>

                <Footer />
            </div>

            {loggingOut && <LogoutOverlay name={user.firstname || user.fullname} />}
        </div>
    );
}