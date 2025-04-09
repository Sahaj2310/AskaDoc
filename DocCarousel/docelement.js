import styles from "./style.module.css";
function Docelement({imgsrc,name,spec}){
    return(
        <div className={styles.cardcontainer}>
            <div className={styles.imgContainer} style={{backgroundImage:`url(${imgsrc})`,backgroundSize:"cover"}}></div>
            <div className={styles.docName}><strong>{name}</strong></div>
            <div className={styles.docSpec}>{spec}</div>
        </div>
    )
}
export default Docelement;