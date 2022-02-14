import "../styles/globals.css";
import useSupabase from "../utils/useSupabase";

function MyApp({ Component, pageProps }) {
  const { session, supabase, currentUser } = useSupabase();
  return (
    <Component
      session={session}
      supabase={supabase}
      currentUser={currentUser}
      {...pageProps}
    />
  );
}

export default MyApp;
