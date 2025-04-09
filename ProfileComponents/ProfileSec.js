import styles from "./style.module.css";
import ProfileIncomplete from "./profile_incomplete";
import ProfileComplete from "./profiole_complete";
import { useEffect, useState } from "react";
function ProfileSec({ username }) {
    let [Userdata, setUserdata] = useState(null);
    let [isComplete,setIsComplete] = useState(false);
    let [checkDone, setCheckDone] = useState(false);

    async function getProfile(username) {
        let user = await fetch(`http://localhost:4000/accounts/${username}`, { method: 'GET' }).then(res => res.json());
        if (user === "Invalid") {
            alert('Invalid request');
            window.location.href = "http://localhost:3000/home/categories";
        }
        console.log(user);
        setUserdata(user);
        if(user.specialization === "") setIsComplete(false);
        else setIsComplete(true);
        setCheckDone(true);
    }

    useEffect(() => {
        getProfile(username);
    }, [])

    return (
        <>
            {checkDone ? (<div className={styles.profileseccontainer}>
                {isComplete ? <ProfileComplete userData={Userdata} /> : <ProfileIncomplete username={Userdata.username} />}
            </div>) : <h1 style={{ color: 'var(--st)' }}>Please wait!</h1>}
        </>
    )
}

export default ProfileSec;