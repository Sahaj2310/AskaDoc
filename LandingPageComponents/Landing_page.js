import styles from './Landing_page.module.css';
import Navbar from '../NavComponents/Navbar';
import Doccarousel from '../DocCarousel/docCarousel';
import Docelement from '../DocCarousel/docelement';
import { useEffect, useState } from 'react';
import img1 from "../assets/images/miscellaneous/online-medical-consultation-male-svgrepo-com.svg";
import step1img from "../assets/images/miscellaneous/account-svgrepo-com.svg";
import step2img from "../assets/images/miscellaneous/doctor-svgrepo-com.svg";
import step3img from "../assets/images/miscellaneous/chat-round-dots-svgrepo-com.svg";
import arrowRight from "../assets/images/miscellaneous/arrow-right-svgrepo-com.svg";

function LP() {
  let [user,setUser] = useState(null);
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

      if (permission) {
        setUser(permission.username);
      }
    }
  }

  useEffect(() => {
    authenticate();
  }, [])
  return (
    <>
      <Navbar username={user}/>
      <div className={styles.quote}><strong>Quality healthcare at your fingertips</strong></div>
      <Doccarousel />
      <div className={styles.introillus}>
        <div className={styles.illus}>
          <img className={styles.illusSvg} src={img1} alt="Online consultation illustration" />
        </div>
        <div className={styles.intro}>
          <div className={styles.introtitle}>Counselling Medical Sessions With <br />Licensed & Verified Experts</div>
          <div className={styles.introtxt}>
            Highly qualified team of some of the best names in Medical Science who deliver improved well-being to you. Carefully vetted through a rigorous selection process. Trained and experienced in all Medical techniques.
          </div>
          <div className={styles.introlist}>
            <ul>
              <li className={styles.intolistitem}>Chat Sessions</li>
              <li className={styles.intolistitem}>English And All Regional Indian Languages</li>
              <li className={styles.intolistitem}>100% Private & Secure Platform</li>
              <li className={styles.intolistitem}>24/7 Support</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.process}>
        <div className={styles.processtitle}>How it works</div>
        <div className={styles.steps}>
          <Docelement imgsrc={step1img} name="Signup and create an account" spec="" />
          <img src={arrowRight} alt='arrow' style={{ width: "10%" }} />
          <Docelement imgsrc={step2img} name="Choose a Counselor by category or search for it" spec="" />
          <img src={arrowRight} alt='arrow' style={{ width: "10%" }} />
          <Docelement imgsrc={step3img} name="Familiarise with the profile and start chatting." spec="" />
        </div>
      </div>
    </>
  );
}

export default LP;
