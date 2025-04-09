import styles from './style.module.css';
import LoginBtn from './LoginBtn';
import SignupBtn from './SignupBtn';
import UserProfileBtn from './usrProfileBtn';

export default function Navbar({ username } = null) {
    let ls = <div className={styles.NavEnd}><LoginBtn /><SignupBtn /></div>
    let up = <div className={styles.NavEnd}><UserProfileBtn username={username} /></div>
    return (
        <div className={styles.Navbar}>
            <div className={styles.logo} onClick={()=>window.location.href = "http://localhost:3000/"}><h1>AskaDoc</h1></div>
            <div className={styles.navlink} onClick={()=>window.location.href = "http://localhost:3000/home/categories" }>Catagories</div>
            <div className={styles.restStuff}>
                {username ? up : ls}
            </div>
        </div>
    )
}