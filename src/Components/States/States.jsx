import { useState , useEffect } from 'react'
import axios from 'axios'

function StateCard( {data} ) {
    console.log(stateData);
    const {name} = stateData;

    return (
        <div>
            <p>
                Name: {name}
            </p>
        </div>
    )
}

function States() {
    const [results, setResults] = useState();
    console.log(results);
    const baseURL = 'https://projectsens.pythonanywhere.com';
    const stateReadEP = 'states/read';

    useEffect(() => {
        axios.get('${baseURL}/${stateReadEP}').then(({data}) => {
            setResults(data.States);
        })
    })

    return (
        <div>
            <h1>state data</h1>
            <ul>
                {results && Object.keys(results).map((objKey) => {
                    return (
                        <StateCard stateData={results[objKey]} key={objKey}/>
                    )
                })}
            </ul>
        </div>
    )
}

export default States
