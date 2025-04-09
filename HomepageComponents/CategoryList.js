import styles from "./style.module.css";
import CatListItem from "./CategoryListItem";
import Select from 'react-select';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SortOptions({ setSortBasis }) {
    const option = [
        {
            value: 'rep',
            label: 'By Reputation'
        },
        {
            value: 'fees',
            label: 'By Fees'
        }
    ]
    const [selectedOption, setSelectedOption] = useState(option[0]);
    useEffect(() => {
        setSortBasis(selectedOption.value);
    }, [selectedOption])
    return (
        <div className={styles.sortsec}>
            <div className={styles.sorttitle}>Sort</div>
            <Select className={styles.sortselect} defaultValue={selectedOption} onChange={setSelectedOption} options={option} />
        </div>
    )
}


function CategoryList() {
    const category = useParams().category.toLowerCase();
    // let arr = [
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 1500,
    //         rep: 1000000
    //     },
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 200,
    //         rep: 20000
    //     },
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 2000,
    //         rep: 20003240
    //     },
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 1000,
    //         rep: 2000200
    //     },
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 1500,
    //         rep: 2000000
    //     },
    //     {
    //         Pimgsrc: require("../assets/images/deep_icpc_1.jpeg"),
    //         name: "Deep Prajapati",
    //         spec: "Psychologist",
    //         fees: 1500,
    //         rep: 2000000
    //     },
    // ]
    let [finalArr, setFinalArr] = useState([]);
    let [dataLoaded, setDataLoaded] = useState(false);
    let [sortBasis, setSortBasis] = useState('rep');

    useEffect(() => {
        let arr2 = finalArr.map(val => val);
        if (sortBasis === 'fees') {
            arr2.sort((a, b) => {
                return (a.fees - b.fees);
            })
        }
        else {
            arr2.sort((a, b) => {
                return (b.reputation - a.reputation);
            })
        }
        setFinalArr(arr2);
    }, [sortBasis])

    let fetchData = () => {
        fetch(`http://localhost:4000/accounts/specialization/${category}`)
            .then(response => {
                return response.json();
            }).then(data => {
                setFinalArr(data);
                setDataLoaded(true);
            })
    }
    useEffect(()=>{
        fetchData();
    },[])   

    return (
        <>
            {dataLoaded ? (<>
                <SortOptions setSortBasis={setSortBasis} />
                <ul className={styles.renderlist}>
                    {finalArr.map(val => {
                        let img = require(`../assets/images/profileImages/${val.ProfileImg}`);
                        return <li><CatListItem Pimgsrc={img} name={val.username} spec={val.specialization} fees={val.fees} rep={val.reputation} /></li>
                    })}
                </ul>
            </>) : <h1 style={{ color: 'var(--st)' }}>Please wait!</h1>}
        </>
    );
}
export default CategoryList;