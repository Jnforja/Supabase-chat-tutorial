import styles from "../styles/Auth.module.css";

function Auth({ supabase }) {
  const signInWithGitHub = async () => {
    supabase.auth.signIn({
      provider: "github",
    });
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Supabase Chat</h1>
      <button className={styles.github} onClick={signInWithGitHub}>
        Sign in with GitHub
      </button>
    </div>
  );
}

export default Auth;
