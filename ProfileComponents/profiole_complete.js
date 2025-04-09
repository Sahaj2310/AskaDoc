import styles from "./style.module.css";
import DoctorSpec from "./DoctorSpec";
import qualification_icon from "../assets/images/icons/qualification-icon.svg";
import experience_icon from "../assets/images/icons/experience-icon.svg";
import language_icon from "../assets/images/icons/language-icon.svg";
import phone_icon from "../assets/images/icons/phone-icon.svg";
import email_icon from "../assets/images/icons/email-icon.svg";
import Whiteheart_icon from "../assets/images/miscellaneous/Whiteheart-svgrepo-com.svg";
import Redheart_icon from "../assets/images/miscellaneous/Redheart-svgrepo-com.svg";
import { useEffect, useState } from "react";

function ProfileComplete({ userData }) {

    let [heart, setHeart] = useState(Whiteheart_icon);
    console.log(userData);

    function handleLike(e) {
        if (heart === Whiteheart_icon) {
            setHeart(Redheart_icon);
        }
        else {
            setHeart(Whiteheart_icon);
        }
    }

    return (
        <>
            <div className={styles.picnamespec}>
                <div className={styles.pic}><img src={require(`../assets/images/profileImages/${userData.ProfileImg}`)} alt={userData.username} style={{ height: "100%" }} /></div>
                <div className={styles.namespec}>
                    <div className={styles.name}>{userData.username}</div>
                    <div className={styles.spec}>{userData.specialization}</div>
                    <button className={styles.likeBtn} onClick={(e) => handleLike(e)}><span>Repute </span><img src={heart} alt="Heart" style={{ width: "25px" }} /></button>
                </div>
            </div>
            <div className={styles.profiletitle}>Profile</div>
            <DoctorSpec field="Qualification" icon={qualification_icon} value={userData.qualification} />
            <DoctorSpec field="Experience" icon={experience_icon} value={userData.experience + " years"} />
            <DoctorSpec field="Languages" icon={language_icon} value={userData.languages} />
            <div className={styles.profiletitle}>Contact</div>
            <DoctorSpec field="Phone" icon={phone_icon} value={userData.tel} />
            <DoctorSpec field="E-mail" icon={email_icon} value={userData.email} />
        </>
    );
}

export default ProfileComplete;