import styles from "./style.module.css";
import defaultImg from "../assets/images/miscellaneous/defaultProfile.svg";
import PhoneInput from 'react-phone-number-input/input';
import Select from 'react-select';
import { currUserContext } from "./profile";
import { useContext, useState } from "react";

function ProfileIncomplete({ username }) {
    const option = [
        {
            value: 'cardiologist',
            label: 'Cardiologist'
        },
        {
            value: 'dermatologist',
            label: 'Dermatologist'
        },
        {
            value: 'endocrinologist',
            label: 'Endocrinologist'
        },
        {
            value: 'gynecologist',
            label: 'Gynecologist'
        },
        {
            value: 'nephrologist',
            label: 'Nephrologist'
        },
        {
            value: 'neurologist',
            label: 'Neurologist'
        },
        {
            value: 'oncologist',
            label: 'Oncologist'
        },
        {
            value: 'orthopedic',
            label: 'Orthopedic'
        },
        {
            value: 'pediatric',
            label: 'Pediatric'
        },
        {
            value: 'psychiatrist',
            label: 'Psychiatrist'
        },
        {
            value: 'urologist',
            label: 'Urologist'
        },
        {
            value: 'radiologist',
            label: 'Radiologist'
        }
        
    ]

    let [pImage, setpImage] = useState(defaultImg);
    let [phone,setPhone] = useState(null);
    let [selectedOption, setSelectedOption] = useState(null);

    let currUser = useContext(currUserContext);

    if(!((currUser.type === 'doctor') && (currUser.username === username))){
        alert("Apologies, but you currently lack the necessary access to view this page.");
        window.location.href = "http://localhost:3000/home/categories";
    }

    function updateImage(event) {
        if(event.target.files[0] )setpImage(URL.createObjectURL(event.target.files[0]));
    }

    return (
        <>
            <div className={styles.picnamespec}>
                <div className={styles.pic}><img src={pImage} alt="Default" style={{ height: "100%" }} /></div>
                <div className={styles.namespec}>
                    <div className={styles.name}>{username}</div>
                    <div className={styles.spec}></div>
                </div>
            </div>
            <form className={styles.profileform} action={"http://localhost:4000/accounts/"+username} method="post" enctype="multipart/form-data">
                <label className={styles.profileinputfields}>
                    Upload Profile Picture<br />
                    <input type="file" name="profilepic" accept="image/*" onChange={updateImage} required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    Specialization<br />
                    <Select defaultValue={selectedOption} onChange={setSelectedOption} options={option} name="specialization" required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    Qualification<br />
                    <input type="text" name="qualification" required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    Years of experience<br />
                    <input type="number" name="experience" required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    Languages(put ',' if more than 1)<br />
                    <input type="text" name="languages" required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    Phone no.<br />
                    <PhoneInput country="In" onChange={setPhone} name="phonenumber" required/>
                </label><br />
                <label className={styles.profileinputfields}>
                    E-mail<br />
                    <input type="email" name="email" required/>
                </label>
                <label className={styles.profileinputfields}>
                    Your charges (per consult)<br />
                    <input type="number" name="fees" required/>
                </label>
                <input type="submit" style={{ width: "25%", marginTop: "10px" }}/>
            </form>
        </>
    );
}
export default ProfileIncomplete;