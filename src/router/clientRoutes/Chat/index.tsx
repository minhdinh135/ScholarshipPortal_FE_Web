import { getAllAccounts } from "@/services/ApiServices/accountService";
import { RootState } from "@/store/store";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { getMessaging, onMessage } from "firebase/messaging";
import { useLocation, useNavigate } from "react-router-dom";
import { getRequestsByApplicantId } from "@/services/ApiServices/requestService";
import { AiOutlineSend } from "react-icons/ai";
import { FaComment, FaRegUser } from "react-icons/fa";
import { getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Account {
  id: number;
  username: string;
  avatarUrl?: string;
  unreadCount: number;
}

interface Message {
  senderId: number;
  receiverId: number;
  message: string;
  timestamp: Date;
  isRead?: boolean;
}

const Chat: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatFirestore, setChatFirestore] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const user = useSelector((state: RootState) => state.token.user);
  const messaging = getMessaging();
  const firestore = getFirestore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const chatCollection = useMemo(() => {
    if (!user || !selectedUser) {
      return null;
    }
    const chatId =
      Number(user.id) < selectedUser.id
        ? `${user.id}_${selectedUser.id}`
        : `${selectedUser.id}_${user.id}`;

    return collection(firestore, "chats", chatId, "messages");
  }, [user?.id, selectedUser?.id]);

  useEffect(() => {
    if (!chatCollection || !user) return;

    const messagesQuery = query(chatCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: {
            _id: data.user._id,
            name: data.user.name,
            avatar: data.user.avatar,
          },
        };
      });

      // Update messages state
      setChatFirestore(
        fetchedMessages.map((msg: any) => ({
          senderId:
            msg.user._id == user?.id ? parseInt(user.id) : selectedUser?.id,
          receiverId:
            msg.user._id == user?.id ? selectedUser?.id : parseInt(user.id),
          message: msg.text,
          timestamp: msg.createdAt,
          isRead: msg.isRead ?? true,
        }))
      );
      console.log("fetchedMessages", fetchedMessages);
      //setMessages((prev) => GiftedChat.append(prev, fetchedMessages));
      //setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [chatCollection, selectedUser]);

  const onSend = async () => {
    if (!message.length || !chatCollection || !user) return;

    //const message = newMessages[0];
    const messageData = {
      text: message,
      createdAt: serverTimestamp(), // Use Firebase Modular SDK's serverTimestamp
      isRead: false,
      user: {
        _id: user.id,
        name: user.username,
        avatar: user.avatar,
      },
    };
    console.log("Message data being sent:", messageData);
    setMessage("");
    try {
      // Add the message to the Firestore collection
      await addDoc(chatCollection, messageData);
      console.log("Message sent successfully:", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const chatUserId = queryParams.get("id");
    if (chatUserId) {
      const userToChat = accounts.find(
        (account) => account.id === parseInt(chatUserId)
      );
      if (userToChat) setSelectedUser(userToChat);
    }
  }, [location.search, accounts]);

  const fetchAccounts = async () => {
    if (user == null) {
      return;
    }
    const role = user.role;
    const response = await getAllAccounts();
    const accountsWithCount = response.map((account: Account) => ({
      ...account,
      unreadCount: 0,
    }));

    const filteredAccounts = accountsWithCount.filter((account: any) => {
      if (role === "Provider") {
        return account.roleName === "Applicant";
      } else if (role === "Applicant") {
        return account.roleName === "Provider";
      }
      return false;
    });

    //const allMessagesResponse = await getAllMessages(parseInt(user.id));
    //const allMessages = allMessagesResponse.data;
    const allMessages = chatFirestore;
    const updatedAccounts = filteredAccounts.map((account: any) => {
      const unreadMessages = allMessages.filter(
        (message: any) => message.senderId === account.id && !message.isRead
      ).length;

      return {
        ...account,
        unreadCount: unreadMessages,
      };
    });

    // Sắp xếp tài khoản theo số lượng tin nhắn chưa đọc
    const sortedAccounts = updatedAccounts.sort(
      (a: any, b: any) => b.unreadCount - a.unreadCount
    );
    setAccounts(sortedAccounts);

    if (role === "Applicant") {
      const requestsResponse = await getRequestsByApplicantId(
        parseInt(user.id)
      );
      const requestData = requestsResponse.data;
      const hasPendingRequest = requestData.some(
        (request: any) => request.status === "Pending"
      );
      setIsChatEnabled(hasPendingRequest);
    } else {
      setIsChatEnabled(true);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChatHistory = async () => {
        if (user == null) {
          return;
        }

        //const history = await getChatHistory(parseInt(user.id), selectedUser.id);
        const history = chatFirestore;
        //console.log("history", history);

        const messagesWithDate = history;

        messagesWithDate.sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setChatHistory(messagesWithDate);
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
        //console.log("messagesWithDate", messagesWithDate);
      };

      fetchChatHistory();
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (
          !event.data.notification &&
          event.data.messageType != "push-received" &&
          window.location.pathname.includes("/chat")
        ) {
          fetchChatHistory();
        }
      });

      const unsubscribe = onMessage(messaging, (payload: any) => {
        if (
          !payload.notification &&
          payload.data.messageType !== "push-received" &&
          window.location.pathname.includes("/chat")
        ) {
          fetchChatHistory();
        }
      });

      return () => {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (
            !event.data.notification &&
            event.data.messageType != "push-received" &&
            window.location.pathname.includes("/chat")
          ) {
            fetchChatHistory();
          }
        });
        unsubscribe();
      };
    }
  }, [selectedUser, chatFirestore]);

  const handleAccountClick = async (account: Account) => {
    const chatUserId = account.id;

    const selectAccount = account;
    navigate(`/chat?id=${chatUserId}`);
    setSelectedUser(selectAccount);

    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.id === account.id ? { ...acc, unreadCount: 0 } : acc
      )
    );

    if (user?.role === "Applicant") {
      const requestsResponse = await getRequestsByApplicantId(
        parseInt(user.id)
      );
      const requestData = requestsResponse.data;
      console.log(requestData);
      const hasPendingRequest = requestData.some(
        (request: any) =>
          request.status === "Pending" &&
          request.service.providerId === account.id
      );
      setIsChatEnabled(hasPendingRequest);
    }
  };

  if (user == null) {
    return <></>;
  }

  return (
    <div className="flex h-screen bg-gray-100 p-8 gap-5">
      <div className="w-1/3 bg-white border-r border-gray-200 p-5 overflow-y-auto rounded-lg shadow-xl ">
        <ul className="space-y-4">
          {accounts.map((account) => (
            <li
              key={account.id}
              onClick={() => handleAccountClick(account)}
              className={`p-3 rounded-lg flex items-center cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedUser?.id === account.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              <img
                src={account.avatarUrl || "https://github.com/shadcn.png"}
                alt={account.username}
                className="w-12 h-12 rounded-full mr-4 shadow-md"
              />
              <div className="flex items-center">
                <span className="text-gray-800 font-medium truncate">
                  {account.username}
                </span>
                {account.unreadCount > 0 && (
                  <span className="h-3 w-3 bg-red-500 rounded-full ml-2" />
                )}
              </div>
              <FaComment
                className="ml-auto text-gray-500 hover:text-blue-600"
                size={24}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          {selectedUser ? (
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FaRegUser className="text-blue-500" />
              Chat with {selectedUser.username}
            </h2>
          ) : (
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Select a user to chat
            </h2>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-5">
          {selectedUser && chatHistory.length > 0
            ? chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start ${
                    msg.senderId === parseInt(user?.id)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-lg shadow-md max-w-sm text-sm ${
                      msg.senderId === parseInt(user?.id)
                        ? "bg-green-200 text-right"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            : selectedUser && (
                <p className="text-center text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </p>
              )}
          <div ref={endOfMessagesRef} />
        </div>

        {selectedUser && (
          <div className="flex items-center mt-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isChatEnabled
                  ? "Type your message..."
                  : "You cannot chat with the provider at this time."
              }
              disabled={!isChatEnabled}
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none mr-3 shadow-sm"
            />
            <button
              onClick={onSend}
              disabled={!isChatEnabled}
              className={`px-6 py-2 rounded-full font-medium text-white transition-all duration-200 ${
                isChatEnabled
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <AiOutlineSend className="inline-block mr-2" size={20} />
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
