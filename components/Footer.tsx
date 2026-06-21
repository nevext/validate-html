import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className="container">
        <p>
          © 2026 Nevext. Todos os direitos reservados.{" "}
          <a href="https://github.com/nevext" target="_blank" rel="noopener">
            github.com/nevext
          </a>
        </p>
      </div>
    </footer>
  );
}
