import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

function useSupabase() {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(supabase.auth.session());

  supabase.auth.onAuthStateChange(async function (_event, session) {
    setSession(session);
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      if (session?.user.id) {
        const { data: currentUser } = await supabase
          .from("user")
          .select("*")
          .eq("id", session.user.id);

        const foundUser = currentUser.find(() => true);
        if (foundUser) {
          supabase
            .from(`user:id=eq.${foundUser.id}`)
            .on("UPDATE", (payload) => setCurrentUser(payload.new))
            .subscribe();
        }
        return foundUser;
      }
    };

    getCurrentUser().then((user) => setCurrentUser(user));
  }, [session]);

  return { currentUser, session, supabase };
}

export default useSupabase;
