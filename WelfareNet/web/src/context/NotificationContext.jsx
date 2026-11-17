import {useState,useEffect,useContext,createContext} from 'react';
import {Client} from'@stomp/stompjs';
import SockJs from 'sockjs-client/dist/sockjs';
import {jwtDecode} from 'jwt-decode';


export const NotificationContext = createContext();

export const NotificationContextProvider = ({children})=>{
    const [notifications, setNotifications] = useState([]);
    const[stompClient,setStompClient]=useState(null);
    const [connected,setConnected]=useState(false);
    const [userId,setUserId]=useState(null);

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    


    useEffect(()=>{
        // Dynamically determine WebSocket URL based on environment and protocol
        const wsBaseUrl = import.meta.env.VITE_WS_URL ;
        const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const wsUrl = wsBaseUrl.replace(/^https?:/, protocol);
        
        const socket = new SockJs(`${wsUrl}/ws`);

        const client = new Client({
            webSocketFactory:()=>socket,
            reconnectionDelay:5000,
            connectHeaders:{
                'Authorization':`Bearer ${token}`
            },
            onConnect:()=>{
                console.log('Connected to WebSocket');
                setConnected(true);

                const handleMessage = (msg) => {
                try {
                    const notif =
                    typeof msg.body === "string" ? JSON.parse(msg.body) : msg.body;
                    setNotifications((prevNotifs) => [notif, ...prevNotifs]);
                    console.log("Received notification:", notif);
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
                };

                //Role base Dubscription
                if(role !== 'null' && token !== 'null'){
                    const decodedToken = jwtDecode(token);
                    console.log("Decoded Token:", decodedToken);
                    setUserId(decodedToken.userId);
                    client.subscribe(`/topic/notifications/${userId}`,handleMessage);
                }

                //Genaral Subscription
                client.subscribe("/topic/notifications/broadcast", handleMessage);
            },
            onWebSocketClose: () => {
                console.warn(" WebSocket closed!");
                setConnected(false);
        },
        });

        client.activate();
        setStompClient(client);

        return () => {
        if (client && connected) {
            client.deactivate();
        }
        };

    },[]);

    return(
        <NotificationContext.Provider
            value={{notifications,setNotifications,stompClient,connected}}
        >
            {children}
        </NotificationContext.Provider>
    );

};