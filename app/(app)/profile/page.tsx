import ProfileForm from "@/components/ProfileForm";
import styles from "./page.module.css";

export default function ProfilePage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Meu perfil</h1>
      <ProfileForm />
    </section>
  );
}
