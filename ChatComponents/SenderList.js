import styles from './style.module.css';
import titleIcon from '../assets/images/miscellaneous/chatTitle.svg';
import SenderListItem from './SenderListItem';
import sampleImg from '../assets/images/miscellaneous/defaultProfile.svg';
import socket from './socket';
import { currUserContext } from '../ProfileComponents/profile';
import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';

function SenderList() {

    let [dataLoaded, setDataLoaded] = useState(false);
    let [senderList, setSenderList] = useState([]);
    let username = useParams().username;
    let currUser = useContext(currUserContext);
    if (!((currUser.type === 'doctor') && (currUser.username === username))) {
        alert("Apologies, but you currently lack the necessary access to view this page.");
        window.location.href = "http://localhost:3000/home/categories";
    }

    if(!dataLoaded){
        socket.connect();
        socket.emit("doctorConnected", {
            username,
            id: socket.id
        })
    }
    socket.on("senderList", ({ arr, username }) => {
        if (username === currUser.username) {
            let list = arr.map((val) => {
               return <SenderListItem profileImg={sampleImg} username={val} />
            })
            console.log(list);
            setDataLoaded(true);
            setSenderList(list);
        }
    })

    return (
        <>
            {dataLoaded ?
                (<div className={styles.ChatSectionContainer}>
                    <div className={styles.titleChat}>
                        <div className={styles.chatIcon}><img src={titleIcon} alt='Chat icon' style={{ width: '100%' }} /></div>
                        <div className={styles.chatTitleText}>Messages</div>
                    </div>
                    {(senderList.length !== 0) ?  senderList  : <h1 style={{ color: "var(--h3)", textAlign: 'center', fontFamily: 'Ubuntu, sans-serif' }}>No messages yet!</h1>}
                </div>) :
                <h1 style={{ color: 'var(--st)' }}>Please refresh!</h1>}
        </>
    );
}

export default SenderList;