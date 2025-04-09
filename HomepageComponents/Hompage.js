import { Outlet } from "react-router-dom";
import Navbar from "../NavComponents/Navbar";
import styles from "./style.module.css";
import { useEffect, useState } from "react";

function Homepage() {
    let [isAuthenticated, setIsAuthenticated] = useState(false);
    let [user, setUser] = useState("");

    async function authenticate() {
        let accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            let permission = await fetch('http://localhost:4000/authenticate', {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${accessToken}`,
                    'Content-Type': "application/json"
                }
            }).then(response => {
                return response.json();
            });

            if (!permission) {
                alert("Please login to continue.");
                window.location.href = 'http://localhost:3000/login';
            }
            else {
                setIsAuthenticated(true);
                setUser(permission.username);
            }
        }
        else {
            alert('Please Login to continue!');
            window.location.href = 'http://localhost:3000/login';
        }
    }

    useEffect(() => {
        authenticate();
    }, [])

    return (
        <>
            {isAuthenticated ? (<>
                <Navbar username={user} />
                <div className={styles.catTitle}>Choose your Consultant</div>
                <Outlet />
            </>) : <h1 style={{ color: 'var(--st)' }}>Please wait!</h1>}
        </>
    )
}
export default Homepage;