import Navbar from "../NavComponents/Navbar";
import styles from "./loginStyle.module.css";
import illus from "../assets/images/miscellaneous/Signup-amico.svg";
import pCheck from "../assets/images/miscellaneous/person-blond-hair-svgrepo-com.svg";
import dCheck from "../assets/images/miscellaneous/health-worker-svgrepo-com.svg";
import { useState } from "react";

function Signup() {
    let [user, setUser] = useState(null);
    let [username, setUsername] = useState(null);
    let [password, setPassword] = useState(null);

    function handlePClick(e) {
        let e1 = document.getElementById("patientCheckBox");
        let e2 = document.getElementById("doctorCheckBox");
        e1.style = "background-color: var(--h3)";
        e2.style = "background-color: var(--h1)"
        setUser("patient");
    }
    function handleDClick(e) {
        let e1 = document.getElementById("patientCheckBox");
        let e2 = document.getElementById("doctorCheckBox");
        e2.style = "background-color: var(--h3)";
        e1.style = "background-color: var(--h1)";
        setUser("doctor");
    }
    async function submit() {
        if (await isValid(user, username, password)) {
            if (user === 'doctor') {
                alert('Signed up successfully. Please complete your profile in order to get listed.');
            }
            await fetch("http://localhost:4000/signup", {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "user": user, "username": username, "password": password })
            })
            let response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, user })
            }).then(res => {
                return res.json();
            })
            localStorage.setItem('accessToken', response.accessToken);
            window.location.href = "http://localhost:3000/home/categories";
        }
    }
    async function isValid(user, username, password) {
        if (!(user && username && password)) {
            alert("Kindly ensure all fields are properly filled before proceeding.");
            return false;
        }
        if (await checkDuplicate(user, username, password)) {
            alert("User already exist. Please enter a different username.");
            return false;
        }
        return true;
    }
    async function checkDuplicate(user, username, password) {
        return (await fetch("http://localhost:4000/signup/checkDuplicate", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "user": user, "username": username, "password": password })
        }).then(res => {
            return res.json();
        }));
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <img src={illus} alt="Illustrator" style={{ width: "40%", backgroundColor: "var(--bg)" }} />
                <div className={styles.LoginContainer}>
                    <div className={styles.loginTitle}>Signup</div>
                    <div className={styles.loginForm}>
                        <div className={styles.checkUser}>
                            <div className={styles.PatCheck}>
                                <img src={pCheck} alt="Patient" style={{ width: "70px" }} />
                                <div className={styles.patCheckBox} id="patientCheckBox" onClick={handlePClick}></div>
                            </div>
                            <div className={styles.DocCheck}>
                                <img src={dCheck} alt="Doctor" style={{ width: "70px" }} />
                                <div className={styles.patCheckBox} id="doctorCheckBox" onClick={handleDClick}></div>
                            </div>
                        </div>
                        <div className={styles.formField}>
                            <div className={styles.formFieldTitle}>Username</div>
                            <input type="text" id="Username" className={styles.InputField} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className={styles.formField}>
                            <div className={styles.formFieldTitle}>Password</div>
                            <input type="password" id="Password" className={styles.InputField} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className={styles.submitBtndiv}><button className={styles.submitBtn} onClick={submit}>Signup</button></div>
                    </div>
                    <div className={styles.signinOption}>Already a member? <a href="./login">Login</a></div>
                </div>
            </div>
        </>
    );
}

export default Signup;