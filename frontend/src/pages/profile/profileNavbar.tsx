import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getUserProfile, logout } from "../../api/profile";
import { getNotifications, markAsRead, markAllAsRead } from "../../api/notification";
import styles from "./ProfileNavbar.module.css";
import { useNavigate } from "react-router-dom";
import type { GlobalRole } from "../../globalTypes";
import CreateProjectForm from "../../components/createProjectForm";

type NotifItem = { id: string; message: string; isRead: boolean; createdAt: string; type: string };
type User = { firstName: string; middleName: string; lastName: string; email: string; avatarUrl?: string; role: GlobalRole };
type Props = { search?: string; onSearch?: (val: string) => void; showSearch?: boolean; pageTitle?: string };

const NOTIF_ICONS: Record<string, string> = {
    TASK_ASSIGNED: "👤",
    TASK_STATUS_CHANGED: "🔄",
    COMMENT_ADDED: "💬",
    USER_MENTIONED: "@",
    NO_USER_ASSIGNED: "⚠️",
};

export default function ProfileNavbar({ search = "", onSearch, showSearch = false, pageTitle }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [panel, setPanel] = useState<"notif" | "menu" | "create" | null>(null);
    const [notifications, setNotifications] = useState<NotifItem[]>([]);
    const [showFullImage, setShowFullImage] = useState(false);
    const navigate = useNavigate();

    // Refs to detect outside clicks
    const bellRef = useRef<HTMLButtonElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getUserProfile()
            .then(d => { setUser(d); localStorage.setItem("globalRole", d.role); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const load = () => getNotifications().then(d => setNotifications(d ?? [])).catch(() => {});
        load();
        const id = setInterval(load, 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        // Capture phase fires before React processes the click.
        // If click is inside a known zone, skip. Otherwise close all panels.
        function onCapture(e: MouseEvent) {
            const t = e.target as Node;
            if (bellRef.current?.contains(t)) return;
            if (notifRef.current?.contains(t)) return;
            if (avatarRef.current?.contains(t)) return;
            if (menuRef.current?.contains(t)) return;
            setPanel(null);
            setShowFullImage(false);
        }
        document.addEventListener("click", onCapture, true); // capture = true
        return () => document.removeEventListener("click", onCapture, true);
    }, []);

    const unread = notifications.filter(n => !n.isRead).length;

    const doMarkAll = () =>
        markAllAsRead()
            .then(() => setNotifications(p => p.map(n => ({ ...n, isRead: true }))))
            .catch(() => {});

    const doMarkOne = (id: string) =>
        markAsRead(id)
            .then(() => setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n)))
            .catch(() => {});

    const doLogout = () => {
        logout().catch(() => {});
        localStorage.removeItem("userId");
        localStorage.removeItem("globalRole");
        navigate("/", { replace: true });
    };

    if (!user) return null;

    const notifPortal = panel === "notif" && createPortal(
        <div ref={notifRef} className={styles.notifDropdown}>
            <div className={styles.notifHeader}>
                <span>
                    Notifications
                    {unread > 0 && <span className={styles.unreadBadge}>{unread} new</span>}
                </span>
                {unread > 0 && (
                    <button className={styles.markAllBtn} onClick={doMarkAll}>Mark all read</button>
                )}
            </div>
            <div className={styles.notifList}>
                {notifications.length === 0
                    ? <div className={styles.notifEmpty}><div style={{ fontSize: 28, marginBottom: 6 }}>🔔</div>You're all caught up!</div>
                    : notifications.map(n => (
                        <div
                            key={n.id}
                            className={`${styles.notifItem} ${!n.isRead ? styles.unread : ""}`}
                            onClick={() => !n.isRead && doMarkOne(n.id)}
                        >
                            <div className={styles.notifIcon}>{NOTIF_ICONS[n.type] ?? "🔔"}</div>
                            <div className={styles.notifContent}>
                                <div className={styles.notifMsg}>{n.message}</div>
                                <div className={styles.notifTime}>
                                    {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                                </div>
                            </div>
                            {!n.isRead && <div className={styles.unreadDot} />}
                        </div>
                    ))
                }
            </div>
        </div>,
        document.body
    );

    const menuPortal = panel === "menu" && createPortal(
        <div ref={menuRef} className={styles.dropdown}>
            <div className={styles.dropdownEmail}>{user.email}</div>
            <div className={styles.dropdownItem} onClick={() => { navigate("/profile/editProfile"); setPanel(null); }}>
                Edit Profile
            </div>
            <div className={styles.logout} onClick={doLogout}>Logout</div>
        </div>,
        document.body
    );

    const imgPortal = showFullImage && user.avatarUrl && createPortal(
        <div className={styles.imageOverlay} onClick={() => setShowFullImage(false)}>
            <img src={user.avatarUrl} className={styles.fullImage} alt="Profile" onClick={e => e.stopPropagation()} />
        </div>,
        document.body
    );

    return (
        <div className={styles.navbar}>
            <div className={styles.left}>
                {pageTitle
                    ? <span className={styles.pageTitle}>{pageTitle}</span>
                    : `Hello, ${user.firstName}${user.lastName ? " " + user.lastName : ""}`
                }
            </div>

            <div className={styles.center}>
                {showSearch && (
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className={styles.search}
                            value={search}
                            onChange={e => onSearch?.(e.target.value)}
                        />
                        {search && (
                            <button className={styles.clearBtn} onClick={() => onSearch?.("")}>✕</button>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.right}>
                {user.role === "ADMIN" && (
                    <div style={{ position: "relative" }}>
                        <button
                            className={styles.createBtn}
                            onClick={() => setPanel(p => p === "create" ? null : "create")}
                        >
                            {panel === "create" ? "✕ Cancel" : "+ Create Project"}
                        </button>
                        {panel === "create" && <CreateProjectForm />}
                    </div>
                )}

                <button
                    ref={bellRef}
                    className={styles.bellBtn}
                    onClick={() => setPanel(p => p === "notif" ? null : "notif")}
                    title="Notifications"
                >
                    🔔
                    {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
                </button>

                <div ref={avatarRef} className={styles.profile}>
                    <img
                        src={user.avatarUrl}
                        alt={user.firstName[0]}
                        className={styles.avatar}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        onClick={() => setPanel(p => p === "menu" ? null : "menu")}
                        onDoubleClick={() => setShowFullImage(true)}
                        title="Click for menu · Double-click to enlarge"
                    />
                </div>
            </div>

            {notifPortal}
            {menuPortal}
            {imgPortal}
        </div>
    );
}
