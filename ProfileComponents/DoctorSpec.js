import styles from "./style.module.css";
function DoctorSpec({ field,icon,value }) {
    return (
        <div className={styles.DoctorSpec}>
            <div className={styles.spectitle}>
                <div className={styles.titleicon}><img src={icon} alt="icon" style={{height:"100%"}}/></div>
                <div className={styles.titlecontent}>{field}</div>
            </div>
            <div className={styles.speccontent}>{value}</div>
        </div>
    );
}
export default DoctorSpec;