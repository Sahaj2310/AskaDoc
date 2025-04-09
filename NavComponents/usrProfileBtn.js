import styles from './style.module.css';

function UserProfileBtn({username}){
    return(
        <button className={styles.usrProfilebtn} onClick={() => window.location.href = `http://localhost:3000/profile/${username}`}>Hii {username}</button>
    );
}
export default UserProfileBtn;