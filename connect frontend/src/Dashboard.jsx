// Dashboard.jsx
import "./polyfills"; // keep if you already created it to fix `global`/buffer issues in the browser
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import authService from "./services/authService";
import { addContact, fetchContacts } from "./services/contactService";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // UI / data state
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messagesMap, setMessagesMap] = useState({}); // { phone: [message,...] }
  const [inputMessage, setInputMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [addContactMessage, setAddContactMessage] = useState("");

  // refs
  const stompClientRef = useRef(null);
  const msgEndRef = useRef(null);

  // derived
  const messages = selectedContact
    ? messagesMap[selectedContact.contactPhone] || []
    : [];

  // Auto-scroll to bottom when messages change / new conversation selected
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedContact, messagesMap, messages]);

  // Load contacts once on mount
  useEffect(() => {
    if (!user) return navigate("/");
    fetchContacts(user.mobile)
      .then((res) => setContacts(res.data))
      .catch(() => setContacts([]));
  }, []); // eslint-disable-line

  // Helper: load history for a contact (REST)
  const loadMessagesFromServer = async (contactPhone) => {
    try {
      const res = await axios.get(
  `http://localhost:8082/api/chat/history/${encodeURIComponent(contactPhone)}`
);

      // Normalize saved messages to expected shape if necessary
      const serverMsgs = Array.isArray(res.data) ? res.data : [];
      setMessagesMap((prev) => ({ ...prev, [contactPhone]: serverMsgs }));
    } catch (err) {
      console.warn("Failed to fetch chat history:", err?.message || err);
      // leave existing messagesMap as-is (optimistic may be present)
    }
  };

  // When a contact is selected in UI
  const loadMessages = (contact) => {
    setSelectedContact(contact);
    // ensure there is an array for this contact in messagesMap
    setMessagesMap((prev) => {
      return { ...prev, [contact.contactPhone]: prev[contact.contactPhone] || [] };
    });
    // fetch server history to populate (will not overwrite optimistic messages)
    loadMessagesFromServer(contact.contactPhone);
  };

  // Initialize WebSocket + STOMP once the user is available
  useEffect(() => {
    if (!user?.mobile) return;

    // Avoid re-creating if already created
    if (stompClientRef.current) {
      return; // already active
    }

    // Create SockJS with phone query param so server's handshake interceptor/handler maps Principal
    const wsUrl = `http://localhost:8082/ws?mobile=${encodeURIComponent(user.mobile)}`;
    const socket = new SockJS(wsUrl);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      // debug output helpful while developing
      debug: (str) => {
        /* eslint-disable no-console */
        console.log("[STOMP]", str);
        /* eslint-enable no-console */
      },
    });

    // When connected, subscribe to the user queue
    client.onConnect = (frame) => {
      console.log("WebSocket connected:", frame?.headers || frame);

      // subscribe to user-specific queue
      client.subscribe("/user/queue/messages", (payload) => {
        try {
          const msg = JSON.parse(payload.body);

          // message shape expected: { id, senderPhone, receiverPhone, content, timestamp }
          if (!msg) return;

          // If server sends a copy to the sender as well, we still want to show it.
          // But avoid duplicate entries: check existing messages in the contact bucket.
          const contactPhone =
            msg.senderPhone === user.mobile ? msg.receiverPhone : msg.senderPhone;

          setMessagesMap((prev) => {
            const existing = prev[contactPhone] || [];

            // Deduplicate: if same id exists OR same content+timestamp exists, skip
            const already = existing.some((m) => {
              if (m.id && msg.id) return m.id === msg.id;
              return m.timestamp === msg.timestamp && m.content === msg.content;
            });
            if (already) return prev;

            const updated = { ...prev, [contactPhone]: [...existing, msg] };
            return updated;
          });

          // Update contacts preview with last message/time and reorder
          setContacts((prev) =>
            prev
              .map((c) =>
                c.contactPhone === contactPhone
                  ? { ...c, lastMessage: msg.content, lastTime: msg.timestamp }
                  : c
              )
              .sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0))
          );
        } catch (err) {
          console.warn("Failed to handle incoming WS message", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error:", frame);
    };

    // activate connection
    client.activate();
    stompClientRef.current = client;

    // Cleanup on unmount
    return () => {
      try {
        client.deactivate();
      } catch (e) {
        /* ignore */
      }
      stompClientRef.current = null;
      console.log("WebSocket disconnected");
    };
  }, [user?.mobile]); // re-run only when phone changes

  // Send a message (STOMP)
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedContact || !stompClientRef.current) return;

    const messageObj = {
      // temporary id for optimistic UI
      id: `tmp-${Date.now()}`,
  receiverPhone: selectedContact.contactPhone,
  content: inputMessage,
  timestamp: new Date().toISOString(),
    };

    // Publish to server
    try {
      stompClientRef.current.publish({
        destination: "/app/send",
        body: JSON.stringify(messageObj),
      });
    } catch (err) {
      console.error("Publish failed:", err);
    }

    // Optimistic UI update: append message locally immediately
    setMessagesMap((prev) => {
      const existing = prev[selectedContact.contactPhone] || [];
      return { ...prev, [selectedContact.contactPhone]: [...existing, messageObj] };
    });

    // Update contacts preview last message/time and sort
    setContacts((prev) =>
      prev
        .map((c) =>
          c.contactPhone === selectedContact.contactPhone
            ? { ...c, lastMessage: inputMessage, lastTime: messageObj.timestamp }
            : c
        )
        .sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0))
    );

    setInputMessage("");
  };

  // Add contact handler (calls your service)
  const handleAddContact = async () => {
    if (!newContactPhone.trim() || !newContactName.trim()) {
      setAddContactMessage("Phone and Name are required");
      return;
    }

    try {
      await addContact(user.mobile, newContactPhone, newContactName);
      setAddContactMessage("Contact added!");

      const res = await fetchContacts(user.mobile);
      setContacts(res.data);

      const newContact = res.data.find((c) => c.contactPhone === newContactPhone);
      if (newContact) {
        loadMessages(newContact);
      }

      setNewContactPhone("");
      setNewContactName("");

      setTimeout(() => {
        setShowAddContact(false);
        setAddContactMessage("");
      }, 800);
    } catch (err) {
      if (err?.response?.status === 404) setAddContactMessage("User does not exist!");
      else if (err?.response?.status === 409) setAddContactMessage("Contact already exists!");
      else setAddContactMessage("Server error");
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d8b5ff, #ffc6e3, #c084fc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          width: "100%",
          maxWidth: "1200px",
          height: "85vh",
          borderRadius: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          display: "flex",
        }}
      >
        {/* LEFT SIDEBAR */}
        <div
          style={{
            width: "35%",
            background: "#f7f7f7",
            borderRight: "2px solid #e5e5e5",
            borderTopLeftRadius: "1.5rem",
            borderBottomLeftRadius: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#ededed",
              padding: "1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopLeftRadius: "1.5rem",
              position: "relative",
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "1.5rem" }}>
              {user?.firstName || "Me"}
            </span>

            <div style={{ position: "relative" }}>
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ cursor: "pointer", fontSize: "2rem" }}
              >
                ⋮
              </div>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "2.5rem",
                    background: "white",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                    borderRadius: "0.8rem",
                    padding: "0.5rem 0",
                    zIndex: 30,
                  }}
                >
                  <div style={{ padding: "0.7rem 1.2rem", cursor: "pointer" }}>Profile</div>
                  <div
                    onClick={() => {
                      setShowAddContact(true);
                      setMenuOpen(false);
                    }}
                    style={{ padding: "0.7rem 1.2rem", cursor: "pointer" }}
                  >
                    Add Contact
                  </div>
                  <div
                    onClick={handleLogout}
                    style={{ padding: "0.7rem 1.2rem", cursor: "pointer" }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTACT LIST */}
          <div style={{ padding: "1rem", overflowY: "auto", flex: 1 }}>
            {contacts.map((c) => (
              <div
                key={c.id || c.contactPhone}
                onClick={() => loadMessages(c)}
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "1rem",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                  marginBottom: "1rem",
                  cursor: "pointer",
                }}
              >
                <strong>{c.contactName}</strong>
                <div style={{ fontSize: "0.85rem", color: "gray" }}>{c.contactPhone}</div>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: 6 }}>
                  {c.lastMessage || ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT PANEL */}
        <div
          style={{
            width: "65%",
            backgroundImage: "url('https://i.ibb.co/MRnkCLY/whatsapp-bg-light.png')",
            backgroundSize: "cover",
            borderTopRightRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#ededed",
              padding: "1.2rem",
              fontWeight: "600",
              borderTopRightRadius: "1.5rem",
              fontSize: "1.3rem",
            }}
          >
            {selectedContact ? selectedContact.contactName : "Select a chat"}
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={m.id ?? `m-${i}`}
                style={{
                  alignSelf: m.senderPhone === user.mobile ? "flex-end" : "flex-start",
                  background: m.senderPhone === user.mobile ? "#dcf8c6" : "white",
                  padding: "1rem 1.4rem",
                  borderRadius: "1rem",
                  maxWidth: "60%",
                }}
              >
                {m.content}
              </div>
            ))}
            <div ref={msgEndRef}></div>
          </div>

          {selectedContact && (
            <div
              style={{
                padding: "1rem",
                display: "flex",
                gap: "1rem",
                borderBottomRightRadius: "1.5rem",
                background: "#f0f0f0",
              }}
            >
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                type="text"
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "0.9rem",
                  borderRadius: "0.8rem",
                  outline: "none",
                  border: "1px solid #d4d4d4",
                  fontSize: "1.1rem",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                style={{
                  background: "#4f46e5",
                  border: "none",
                  color: "white",
                  fontWeight: "600",
                  padding: "0 1.8rem",
                  borderRadius: "1rem",
                  fontSize: "1.2rem",
                }}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddContact && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "1rem",
              width: "380px",
              textAlign: "center",
            }}
          >
            <h2>Add Contact</h2>

            <input
              type="text"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              placeholder="Enter phone number"
              style={{
                width: "100%",
                padding: "0.8rem",
                marginTop: "1rem",
                borderRadius: "0.6rem",
                border: "1px solid gray",
              }}
            />

            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Enter contact name"
              style={{
                width: "100%",
                padding: "0.8rem",
                marginTop: "1rem",
                borderRadius: "0.6rem",
                border: "1px solid gray",
              }}
            />

            <p style={{ marginTop: "0.6rem", color: "red" }}>{addContactMessage}</p>

            <div style={{ display: "flex", marginTop: "1.5rem", gap: "1rem" }}>
              <button
                onClick={() => setShowAddContact(false)}
                style={{
                  flex: 1,
                  background: "#aaa",
                  border: "none",
                  padding: "0.8rem",
                  borderRadius: "0.6rem",
                  color: "white",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAddContact}
                style={{
                  flex: 1,
                  background: "#4f46e5",
                  border: "none",
                  padding: "0.8rem",
                  borderRadius: "0.6rem",
                  color: "white",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
