import Head from "next/head";
import { useEffect, useState } from "react";
import Auth from "../components/auth";
import Chat from "../components/chat";
import styles from "../styles/Home.module.css";

export default function Home({ session, supabase, currentUser }) {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(!!session);
  }, [session]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Supabase Chat App</title>
      </Head>

      <main className={styles.main}>
        {loggedIn ? (
          <Chat
            supabase={supabase}
            session={session}
            currentUser={currentUser}
          />
        ) : (
          <Auth supabase={supabase} />
        )}
      </main>
    </div>
  );
}
