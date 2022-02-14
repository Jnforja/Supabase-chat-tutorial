import { useEffect, useRef, useState } from "react";
import styles from "../styles/Chat.module.css";

function Chat({ supabase, session, currentUser }) {
  const [messages, setMessages] = useState([]);
  const message = useRef("");
  const newUsername = useRef("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [users, setUsers] = useState({});

  useEffect(() => {
    async function getMessages() {
      let { data } = await supabase.from("message").select("*");
      setMessages(data);
    }

    async function setupMessagesSubscription() {
      supabase
        .from("message")
        .on("INSERT", (payload) => {
          setMessages((previous) => [].concat(previous, payload.new));
        })
        .subscribe();
    }

    async function setupUsersSubscription() {
      await supabase
        .from("user")
        .on("UPDATE", (payload) => {
          setUsers((users) => {
            const user = users[payload.new.id];
            if (user) {
              return Object.assign({}, users, {
                [payload.new.id]: payload.new,
              });
            } else {
              return users;
            }
          });
        })
        .subscribe();
    }

    getMessages();
    setupMessagesSubscription();
    setupUsersSubscription();
  }, [supabase]);

  const getUserFromSupabase = async (users, userIds) => {
    const usersToGet = Array.from(userIds).filter((id) => !users[id]);
    if (Object.keys(users).length && usersToGet.length == 0) return users;

    const { data } = await supabase
      .from("user")
      .select("id,username")
      .in("id", usersToGet);

    const newUsers = {};
    data.forEach((user) => (newUsers[user.id] = user));
    return Object.assign({}, users, newUsers);
  };

  useEffect(() => {
    const getUsers = async () => {
      const userIds = new Set(messages.map((message) => message.user_id));
      const newUsers = await getUserFromSupabase(users, userIds);
      setUsers(newUsers);
    };
    getUsers();
  }, [messages]);

  const sendMessage = async (evt) => {
    evt.preventDefault();
    const content = message.current.value;
    await supabase.from("message").insert([
      {
        content,
        user_id: session.user.id,
      },
    ]);
    message.current.value = "";
  };

  const logout = (evt) => {
    evt.preventDefault();
    supabase.auth.signOut();
  };

  const setUsername = async (evt) => {
    evt.preventDefault();
    const username = newUsername.current.value;
    await supabase
      .from("user")
      .insert([{ ...currentUser, username }], { upsert: true });
    newUsername.current.value = "";
    setEditingUsername(false);
  };

  const getUsername = (user_id) => {
    const user = users[user_id];
    if (!user) return "";
    return user.username ?? user.id;
  };

  if (!currentUser || !session) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Supabase Chat</h1>
          <p>
            Welcome,{" "}
            {currentUser.username ? currentUser.username : session.user.email}
          </p>
        </div>
        <div className={styles.settings}>
          {editingUsername ? (
            <form onSubmit={setUsername}>
              <input
                placeholder="new username"
                required
                ref={newUsername}
              ></input>
              <button type="submit">Update username</button>
            </form>
          ) : (
            <div>
              <button onClick={() => setEditingUsername(true)}>
                Edit username
              </button>
              <button onClick={logout}>Log out</button>
            </div>
          )}
        </div>
      </div>
      <ul className={styles.container}>
        {messages.map((message) => (
          <li key={message.id} className={styles.messageContainer}>
            <span className={styles.user}>{getUsername(message.user_id)}</span>
            <div>{message.content}</div>
          </li>
        ))}
      </ul>
      <form className={styles.chat} onSubmit={sendMessage}>
        <input
          className={styles.messageInput}
          required
          type="text"
          placeholder="Write your message"
          ref={message}
        />
        <button className={styles.submit} type="submit">
          Send
        </button>
      </form>
    </>
  );
}

export default Chat;
