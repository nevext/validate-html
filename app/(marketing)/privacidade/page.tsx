import styles from "./page.module.css";

export default function PrivacyPolicyPage() {
  return (
    <section className={`${styles.page} container`}>
      <h1 className={styles.title}>Política de Privacidade</h1>
      <p className={styles.updatedAt}>Última atualização: 21/06/2026 — texto inicial, sujeito a revisão.</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quais dados coletamos</h2>
        <p className={styles.paragraph}>
          De quem cria uma conta: nome, email, foto de perfil (se enviada), curso e faculdade (se
          informados), e os projetos e builds que você cria (título, tipo de conteúdo, link).
        </p>
        <p className={styles.paragraph}>
          De quem responde uma validação pelo link público: as respostas do checklist, comentários
          e bugs relatados. Esse envio é anônimo — não pedimos nome nem email de quem valida.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Para que usamos esses dados</h2>
        <p className={styles.paragraph}>
          Para fazer o Validate funcionar: autenticar sua conta, mostrar seus projetos no
          dashboard, gerar os links públicos de validação e exibir as respostas recebidas pra
          você. Não vendemos nem compartilhamos seus dados com terceiros para fins de publicidade.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Onde os dados ficam armazenados</h2>
        <p className={styles.paragraph}>
          Usamos o Firebase (Google) para autenticação, banco de dados (Firestore) e armazenamento
          de arquivos (Storage). Os dados ficam na infraestrutura do Firebase, sujeita às próprias
          políticas de segurança do Google Cloud.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Seus direitos</h2>
        <p className={styles.paragraph}>
          Você pode editar ou excluir seus dados de perfil a qualquer momento pela página de
          perfil. Para excluir sua conta e os projetos associados, contate-nos pelo
          github.com/nevext.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contato</h2>
        <p className={styles.paragraph}>
          Dúvidas sobre esta política podem ser enviadas via{" "}
          <a href="https://github.com/nevext" target="_blank" rel="noopener">
            github.com/nevext
          </a>
          .
        </p>
      </div>
    </section>
  );
}
