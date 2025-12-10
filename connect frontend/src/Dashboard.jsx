import "./polyfills";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import authService from "./services/authService";
import { addContact, fetchContacts } from "./services/contactService";
import axios from "axios";

// Backend URL - declared OUTSIDE the component
const BACKEND_URL = "http://localhost:8082";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [addContactMessage, setAddContactMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [muted, setMuted] = useState(false);

  const stompClientRef = useRef(null);
  const msgEndRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const headerMenuRef = useRef(null);
  const headerMenuButtonRef = useRef(null);

  const messages = selectedContact ? messagesMap[selectedContact.contactPhone] || [] : [];

  /* AUTO SCROLL */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* MENU CLOSE */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target) && !menuButtonRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
      if (headerMenuOpen && headerMenuRef.current && !headerMenuRef.current.contains(e.target) && !headerMenuButtonRef.current?.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, headerMenuOpen]);

  /* LOAD CONTACTS */
  useEffect(() => {
    if (!user) return navigate("/");
    fetchContacts(user.mobile)
      .then((res) => setContacts(res.data))
      .catch(() => setContacts([]));
  }, []); // eslint-disable-line

  const loadMessagesFromServer = async (contactPhone) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/chat/history/${encodeURIComponent(contactPhone)}`,
        { headers: { "X-Mobile": user.mobile } }
      );
      const serverMsgs = Array.isArray(res.data) ? res.data : [];
      setMessagesMap((prev) => ({ ...prev, [contactPhone]: serverMsgs }));
    } catch { }
  };

  const loadMessages = (contact) => {
    const contactWithBlocked = {
      ...contact,
      blocked: contact.blocked ?? false
    };
    setSelectedContact(contactWithBlocked);
    setMessagesMap((prev) => ({ ...prev, [contact.contactPhone]: prev[contact.contactPhone] || [] }));
    loadMessagesFromServer(contact.contactPhone);
  };

  /* WS CONNECT */
  useEffect(() => {
    if (!user?.mobile) return;
    if (stompClientRef.current) return;

    const socket = new SockJS(`${BACKEND_URL}/ws?mobile=${encodeURIComponent(user.mobile)}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
    });

    client.onConnect = () => {
      client.subscribe("/user/queue/messages", (payload) => {
        const msg = JSON.parse(payload.body);
        const contactPhone = msg.senderPhone === user.mobile ? msg.receiverPhone : msg.senderPhone;

        setMessagesMap((prev) => {
          const updated = [...(prev[contactPhone] || []), msg];
          return { ...prev, [contactPhone]: updated };
        });
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [user?.mobile]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedContact || !stompClientRef.current) return;

    const messageObj = {
      clientTempId: `tmp-${Date.now()}`,
      receiverPhone: selectedContact.contactPhone,
      content: inputMessage,
      timestamp: new Date().toISOString(),
      id: `tmp-${Date.now()}`,
    };

    stompClientRef.current.publish({
      destination: "/app/send",
      body: JSON.stringify(messageObj),
    });

    setMessagesMap((prev) => {
      const updated = [...(prev[selectedContact.contactPhone] || []), messageObj];
      return { ...prev, [selectedContact.contactPhone]: updated };
    });

    setInputMessage("");
  };

  /* ADD CONTACT */
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
      if (newContact) loadMessages(newContact);

      setTimeout(() => {
        setShowAddContact(false);
        setAddContactMessage("");
      }, 800);
    } catch { }
  };

  /* HEADER MENU ACTIONS */
  const handleViewContact = () => {
    setShowContactInfo(true);
    setHeaderMenuOpen(false);
  };

  const handleClearChat = async () => {
    if (!selectedContact) return;
    try {
      await axios.delete(
        `${BACKEND_URL}/api/chat/clear/${encodeURIComponent(selectedContact.contactPhone)}`,
        { headers: { "X-Mobile": user.mobile } }
      );
      setMessagesMap((prev) => ({ ...prev, [selectedContact.contactPhone]: [] }));
      setHeaderMenuOpen(false);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedContact) return;
    try {
      const newBlockedStatus = !(selectedContact.blocked ?? false);
      
      const response = await axios.patch(
        `${BACKEND_URL}/contacts/block`,
        {},
        {
          params: {
            owner: user.mobile,
            contact: selectedContact.contactPhone,
            blocked: newBlockedStatus
          }
        }
      );
      
      console.log("Block toggle success:", response.data);
      
      setSelectedContact({ ...selectedContact, blocked: newBlockedStatus });
      
      setContacts((prev) =>
        prev.map((c) =>
          c.contactPhone === selectedContact.contactPhone
            ? { ...c, blocked: newBlockedStatus }
            : c
        )
      );
      setHeaderMenuOpen(false);
    } catch (err) {
      console.error("Error toggling block:", err);
      console.error("Error details:", err.response?.data);
      alert(`Failed to update block status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleMute = () => {
    setMuted((prev) => !prev);
    setHeaderMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  /* UI */
  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "#e5ddd5" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12" style={{ maxWidth: 1200 }}>
            <div className="card shadow border-0" style={{ height: "85vh", borderRadius: 16, overflow: "hidden" }}>
              <div className="row g-0 h-100">

                {/* CONTACTS PANEL */}
                <div className="col-md-4 border-end d-flex flex-column" style={{ background: "#f7f7f7", height: "100%" }}>
                  <div className="d-flex align-items-center justify-content-between p-3" style={{ background: "#ededed", flexShrink: 0 }}>
                    <div className="fw-bold fs-5">{user?.firstName || "Me"}</div>

                    <div className="position-relative">
                      <button ref={menuButtonRef} className="btn btn-sm btn-light" onClick={() => setMenuOpen((s) => !s)}>⋮</button>
                      {menuOpen && (
                        <div ref={menuRef} className="position-absolute bg-white shadow rounded" style={{ right: 0, top: "2.5rem", minWidth: 160, zIndex: 2000 }}>
                          <div className="px-3 py-2" onClick={() => { setShowProfile(true); setMenuOpen(false); }} style={{ cursor: "pointer" }}>Profile</div>
                          <div className="px-3 py-2" onClick={() => { setShowAddContact(true); setMenuOpen(false); }} style={{ cursor: "pointer" }}>Add Contact</div>
                          <div className="px-3 py-2 text-danger" onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ cursor: "pointer" }}>Logout</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 flex-grow-1 overflow-auto">
                    {contacts.map((c) => (
                      <div
                        key={c.id || c.contactPhone}
                        onClick={() => loadMessages(c)}
                        className={`card mb-3 ${selectedContact?.contactPhone === c.contactPhone ? "border-primary" : ""}`}
                        style={{ cursor: "pointer", borderRadius: 12 }}
                      >
                        <div className="card-body py-2">
                          <div className="fw-semibold">{c.contactName}</div>
                          <div className="text-muted small">{c.contactPhone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CHAT PANEL */}
                <div className="col-md-8 d-flex flex-column" style={{ height: "100%" }}>
                  
                  {/* HEADER - Fixed at top with menu */}
                  <div className="p-3 d-flex align-items-center justify-content-between" style={{ background: "#ededed", flexShrink: 0 }}>
                    <div className="fw-semibold">{selectedContact ? selectedContact.contactName : "Select a chat"}</div>
                    
                    {selectedContact && (
                      <div className="position-relative">
                        <button ref={headerMenuButtonRef} className="btn btn-sm btn-light" onClick={() => setHeaderMenuOpen((s) => !s)}>⋮</button>
                        {headerMenuOpen && (
                          <div ref={headerMenuRef} className="position-absolute bg-white shadow rounded" style={{ right: 0, top: "2.5rem", minWidth: 160, zIndex: 2000 }}>
                            <div className="px-3 py-2" onClick={handleViewContact} style={{ cursor: "pointer" }}>View Contact</div>
                            <div className="px-3 py-2" onClick={handleClearChat} style={{ cursor: "pointer" }}>Clear Chat</div>
                            <div className="px-3 py-2" onClick={handleToggleBlock} style={{ cursor: "pointer" }}>
                              {selectedContact.blocked ? "Unblock" : "Block"}
                            </div>
                            <div className="px-3 py-2" onClick={handleToggleMute} style={{ cursor: "pointer" }}>
                              {muted ? "Unmute" : "Mute"}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SCROLLABLE MESSAGES AREA ONLY */}
                  <div 
                    className="flex-grow-1 p-3 overflow-auto d-flex flex-column"
                    style={{ gap: 12, minHeight: 0, background: "#e5ddd5" }}
                  >
                    {messages.map((m, i) => (
                      <div
                        key={m.id ?? `m-${i}`}
                        className={`d-inline-block p-3 rounded-3 ${m.senderPhone === user.mobile ? "ms-auto bg-success text-white" : "bg-white"}`}
                        style={{ maxWidth: "60%" }}
                      >
                        {m.content}
                      </div>
                    ))}
                    <div ref={msgEndRef} />
                  </div>

                  {/* INPUT - Fixed at bottom */}
                  {selectedContact && (
                    <div className="p-3" style={{ background: "#f0f0f0", flexShrink: 0 }}>
                      <div className="input-group">
                        <input 
                          value={inputMessage} 
                          onChange={(e) => setInputMessage(e.target.value)} 
                          type="text" 
                          className="form-control" 
                          placeholder="Type a message..." 
                          onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                        />
                        <button className="btn btn-primary" onClick={sendMessage}>➤</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----- MODALS BELOW ----- */}
      {showAddContact && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Add Contact</h5>
                <button className="btn-close" onClick={() => setShowAddContact(false)} />
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Phone number" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
                <input className="form-control mb-2" placeholder="Contact name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
                <div className="text-danger small">{addContactMessage}</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddContact(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddContact}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Profile</h5>
                <button className="btn-close" onClick={() => setShowProfile(false)} />
              </div>
              <div className="modal-body text-center">
                <div className="rounded-circle bg-primary text-white mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80, fontSize: 32 }}>
                  {user?.firstName?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="fw-semibold fs-5">{user?.firstName} {user?.lastName}</div>
                <div className="mt-3">
                  <div className="text-muted small">Phone Number</div>
                  <div>{user?.mobile}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowProfile(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContactInfo && selectedContact && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Contact Info</h5>
                <button className="btn-close" onClick={() => setShowContactInfo(false)} />
              </div>
              <div className="modal-body text-center">
                <div className="rounded-circle bg-secondary text-white mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80, fontSize: 32 }}>
                  {selectedContact.contactName?.charAt(0).toUpperCase() ?? "C"}
                </div>
                <div className="fw-semibold fs-5">{selectedContact.contactName}</div>
                <div className="mt-3">
                  <div className="text-muted small">Phone Number</div>
                  <div>{selectedContact.contactPhone}</div>
                </div>
                {selectedContact.blocked && (
                  <div className="mt-3">
                    <span className="badge bg-danger">Blocked</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowContactInfo(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}