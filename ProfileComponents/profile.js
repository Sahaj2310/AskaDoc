import Navbar from "../NavComponents/Navbar";
import ProfileSec from "./ProfileSec";
import styles from "./style.module.css";
import { Outlet, useParams } from "react-router-dom";
import { createContext, useEffect, useState } from "react";


function Profile() {
    const { username } = useParams();
    let [isAuthenticated, setIsAuthenticated] = useState(false);
    let [currUser, setCurrUser] = useState({});
    
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
                setCurrUser(permission);
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
                <currUserContext.Provider value={currUser}>
                    <Navbar username={currUser.username} />
                    <div className={styles.profilechatcontainer}>
                        <ProfileSec username={username} />
                        <Outlet />
                    </div>
                </currUserContext.Provider>
            </>) : <h1 style={{ color: 'var(--st)' }}>Please wait!</h1>}
        </>
    );
}
export default Profile;
export const currUserContext = createContext();