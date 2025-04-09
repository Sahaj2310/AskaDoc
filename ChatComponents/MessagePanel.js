import styles from './style.module.css';
import samplePic from '../assets/images/miscellaneous/defaultProfile.svg';
import socket from './socket';
import { useContext, useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { currUserContext } from '../ProfileComponents/profile';

function MessagePanel() {
    let [searchParams, setSearchParams] = useSearchParams();
    let [chats, setChats] = useState([]);
    let [message, setMessage] = useState("");

    let currUser = useContext(currUserContext);
    let senderUsername = searchParams.get('username');

    if (currUser.username === senderUsername) {
        window.location.href = `http://localhost:3000/profile/${currUser.username}`;
    }

    socket.auth = { username: currUser.username, to: senderUsername }
    socket.connect();
    socket.on('messageRecieved', ({ SenderUsername, message, reciever }) => {
        console.log(currUser.username);
        if ((SenderUsername === senderUsername) && (reciever === currUser.username)) {
            console.log([SenderUsername, message, reciever]);
            let arr = chats.map(val => val);
            arr.push(<SenderMessageObj username={SenderUsername} content={message} key={Math.floor(Math.random() * 100000)} />);
            setChats(arr);
        }
    })

    function sendMessage() {
        if (message !== "") {
            let arr = chats.map(val => val);
            arr.push(<UserMessageObj content={message} key={Math.floor(Math.random() * 100000)} />);
            socket.emit('messageSent', { senderUsername: currUser.username, message, reciever: senderUsername });
            setChats(arr);
        }
    }

    function preventReload(e) {
        e.preventDefault();
        document.getElementById("MessageInputField").reset();
    }

    return (
        <div className={styles.ChatSectionContainer}>
            <div className={styles.senderInfo}>
                <div className={styles.senderDP} style={{ backgroundImage: `url(${samplePic})`, backgroundSize: "cover" }}></div>
                <div className={styles.senderUsername}>{senderUsername}</div>
            </div>
            <div className={styles.MessageContainer}>
                {chats}
            </div>
            <form onSubmit={(e) => preventReload(e)} id='MessageInputField'>
                <div className={styles.MessageForm}>
                    <input type='text' className={styles.MessageInput} placeholder='Message..' onChange={(e) => setMessage(e.target.value)} />
                    <button type='submit' className={styles.MessageSendBtn} onClick={sendMessage}>Send</button>
                </div>
            </form>
        </div>
    );
}

function SenderMessageObj({ username, content }) {
    return (
        <div className={styles.SenderMO}>
            <div className={styles.SenderUsername}>{username}</div>
            <div className={styles.SenderContent}>{content}</div>
        </div>
    );
}

function UserMessageObj({ content }) {
    return (
        <div className={styles.UserMO}>
            <div className={styles.UserUsername}>You</div>
            <div className={styles.Usercontent}>{content}</div>
        </div>
    );
}

export default MessagePanel;