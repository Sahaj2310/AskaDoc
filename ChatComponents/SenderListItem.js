import styles from './style.module.css';
import { currUserContext } from '../ProfileComponents/profile';
import { useContext } from 'react';

function SenderListItem({profileImg, username}){
    let currUser = useContext(currUserContext);
    return(
        <div className={styles.SLIContainer} onClick={() => window.location.href=`http://localhost:3000/profile/${currUser.username}/chatWith?username=${username}`}>   
            <div className={styles.ChatuserImage}><img src={profileImg} alt='Profile picture' style={{width:'100%'}}/></div>
            <div className={styles.ChatUsername}>{username}</div>
        </div>
    );
}

export default SenderListItem;