import RequireAuth from "@/components/RequireAuth";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className={styles.shell}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </RequireAuth>
  );
}
