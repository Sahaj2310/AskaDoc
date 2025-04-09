import styles from './style.module.css';

export default function SignupBtn(){
    function changeLocation(){
        window.location.href = "http://localhost:3000/signup";
    }
    return (
        <button className={styles.loginBtn} onClick={changeLocation}>Signup</button>
    )
}