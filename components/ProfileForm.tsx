"use client";

import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import Button from "./Button";
import { auth } from "@/lib/firebase";
import { getUserProfile, upsertUserProfile } from "@/lib/firestore";
import { uploadProfilePhoto } from "@/lib/storage";
import { changePassword } from "@/lib/auth-actions";
import styles from "./ProfileForm.module.css";

export default function ProfileForm() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName ?? "");
  const [course, setCourse] = useState("");
  const [university, setUniversity] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL ?? "");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profilePending, setProfilePending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((profile) => {
      if (profile) {
        setCourse(profile.course);
        setUniversity(profile.university);
      }
    });
  }, [user]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProfileError("");
    setProfileSuccess(false);
    setProfilePending(true);

    let photoURL = user.photoURL ?? undefined;
    let photoUploadError = "";
    if (photoFile) {
      try {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      } catch (error) {
        photoUploadError =
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a foto. Confirme que o Firebase Storage está habilitado.";
      }
    }

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim(), photoURL });
      }
      await upsertUserProfile(user.uid, { course: course.trim(), university: university.trim() });
      if (photoUploadError) {
        setProfileError(`Nome/curso/faculdade salvos. ${photoUploadError}`);
      } else {
        setProfileSuccess(true);
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch {
      setProfileError("Não foi possível salvar.");
    } finally {
      setProfilePending(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas novas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setPasswordPending(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordPending(false);

    if (result.error) {
      setPasswordError(result.error);
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleProfileSubmit}>
        <h2 className={styles.formTitle}>Seus dados</h2>

        <div className={styles.photoRow}>
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Foto de perfil" className={styles.photoPreview} />
          ) : (
            <div className={styles.photoPlaceholder}>{name.charAt(0).toUpperCase() || "?"}</div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className={styles.fileInput} />
        </div>

        <label className={styles.fieldLabel} htmlFor="profile-name">
          Nome
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />

        <label className={styles.fieldLabel} htmlFor="profile-course">
          Curso
        </label>
        <input
          id="profile-course"
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Ex: Design Digital"
          className={styles.input}
        />

        <label className={styles.fieldLabel} htmlFor="profile-university">
          Faculdade
        </label>
        <input
          id="profile-university"
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="Ex: CIESA"
          className={styles.input}
        />

        {profileError && <p className={styles.error}>{profileError}</p>}
        {profileSuccess && <p className={styles.success}>Salvo! Atualizando a página...</p>}

        <Button type="submit" disabled={profilePending}>
          {profilePending ? "Salvando..." : "Salvar"}
        </Button>
      </form>

      <form className={styles.form} onSubmit={handlePasswordSubmit}>
        <h2 className={styles.formTitle}>Trocar senha</h2>

        <label className={styles.fieldLabel} htmlFor="current-password">
          Senha atual
        </label>
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={styles.input}
        />

        <label className={styles.fieldLabel} htmlFor="new-password">
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          className={styles.input}
        />

        <label className={styles.fieldLabel} htmlFor="confirm-password">
          Confirmar nova senha
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          className={styles.input}
        />

        {passwordError && <p className={styles.error}>{passwordError}</p>}
        {passwordSuccess && <p className={styles.success}>Senha atualizada.</p>}

        <Button type="submit" variant="secondary" disabled={passwordPending}>
          {passwordPending ? "Atualizando..." : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
