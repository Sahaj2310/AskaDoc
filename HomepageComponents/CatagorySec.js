import styles from  "./style.module.css";
import Card from "./CatagoryCard";
import { specImages } from "../assets/images/specImages/index.js";

function CatagorySec() {
    return (
        <div>
            <div className={styles.container1}>
                <Card imgsrc={specImages[0]} spec="Cardiologist" specinfo="Meet an expert in heart and blood vessel diseases" />
                <Card imgsrc={specImages[1]} spec="Dermatologist" specinfo="Specialist in conditions that affects skin, hair and nails" />
                <Card imgsrc={specImages[2]} spec="Endocrinologist" specinfo="Specialist in conditions related to hormones" />
                <Card imgsrc={specImages[3]} spec="Gynecologist" specinfo="Specialist in reproductive and sexual health services" />
            </div>
            <div className={styles.container1}>
                <Card imgsrc={specImages[4]} spec="Nephrologist" specinfo="Consult for kidney related problems" />
                <Card imgsrc={specImages[5]} spec="Neurologist" specinfo="Specialist for brain, spinal cord and nerve related problems" />
                <Card imgsrc={specImages[6]} spec="Oncologist" specinfo="Specializes in diagnosing and treating cancer" />
                <Card imgsrc={specImages[7]} spec="Orthopedic" specinfo="Specializes in musculoskeletal system" />
            </div>
            <div className={styles.container1}>
                <Card imgsrc={specImages[8]} spec="Pediatric" specinfo="Medical care for infants, children, adolescents, and young adults" />
                <Card imgsrc={specImages[9]} spec="Psychiatrist" specinfo="Manage your mental, emotional and behavioral conditions" />
                <Card imgsrc={specImages[10]} spec="Radiologist" specinfo="Specialist in diagonosing and treating injuries using radiology" />
                <Card imgsrc={specImages[11]} spec="Urologist" specinfo="Specialist for urinary tract for men, women and children" />
            </div>

        </div>
    );
}

export default CatagorySec;