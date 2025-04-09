import styles from "./style.module.css";
import heart from "../assets/images/miscellaneous/heart-svgrepo-com.svg"

function CatListItem({ Pimgsrc, name, spec, fees, rep }) {
    return (
        <div className={styles.categorylistitem} onClick={() => window.location.href = `http://localhost:3000/profile/${name}/chatWith?username=${name}`}>
            <div className={styles.profilenamespec}>
                <div className={styles.profileimg} style={{backgroundImage:`url(${Pimgsrc})`,backgroundSize:"cover"}}></div>
                <div className={styles.namespec}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.spec}>{spec}</div>
                </div>
            </div>
            <div className={styles.fees}>₹{fees}/consult</div>
            <div className={styles.rep}><img src={heart} alt="heart" style={{ width: "16px" }} /> {nFormatter(rep,0)}</div>
        </div>
    );
}
function nFormatter(num, digits) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}
export default CatListItem;